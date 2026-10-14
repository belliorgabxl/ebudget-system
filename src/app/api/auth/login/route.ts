import { NextResponse } from "next/server";
import { decodeExternalJwt, signUserToken } from "@/lib/auth";
import { pickHomeByRole } from "@/lib/rbac";

type LoginBody = { username: string; password: string; remember?: boolean };

function pickSafeMessage(data: any) {
  return data?.message || data?.error || "";
}

// Returns the seconds-from-now a token is actually valid for, read from its own
// exp claim — cookie maxAge must track the JWT's real lifetime, not a value the
// frontend picks independently, or the cookie can outlive (or expire before) the
// token it holds.
function maxAgeFromJwt(token: string | undefined, fallbackSec: number): number {
  if (!token) return fallbackSec;
  const claims = decodeExternalJwt<{ exp?: number }>(token);
  if (typeof claims?.exp !== "number") return fallbackSec;
  const sec = claims.exp - Math.floor(Date.now() / 1000);
  return sec > 0 ? sec : 0;
}

const BACKEND_UNAVAILABLE_MESSAGE =
  "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่ภายหลัง หรือแจ้งผู้ดูแลระบบ";

// An error that means "the backend is unreachable or not an API at all" —
// never an authentication result — so it must not surface as a credentials error.
function backendUnavailable(reason: string): Error {
  console.error("[auth/login] backend unavailable:", reason);
  const e = new Error(BACKEND_UNAVAILABLE_MESSAGE);
  (e as any).status = 502;
  return e;
}

async function loginExternal(username: string, password: string) {
  const baseURL = process.env.API_BASE_URL;
  if (!baseURL) {
    console.error("[auth/login] API_BASE_URL is not configured");
    const e = new Error(BACKEND_UNAVAILABLE_MESSAGE);
    (e as any).status = 500;
    throw e;
  }

  let res: Response;
  try {
    res = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch (err: any) {
    throw backendUnavailable(`fetch failed: ${err?.message ?? err}`);
  }

  if (!res.ok) {
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      payload = { message: await res.text().catch(() => "") };
    }

    const safe = pickSafeMessage(payload) || "External login failed";

    if (res.status === 401 || res.status === 403) {
      const e = new Error("Invalid username or password");
      (e as any).status = 401;
      throw e;
    }

    // 5xx / other non-auth failures: show a generic availability message, not backend internals
    throw backendUnavailable(`status ${res.status}: ${safe}`);
  }

  // A 200 that isn't JSON (e.g. a parked domain or proxy error page) is not a login result
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw backendUnavailable(`unexpected content-type "${contentType}" from ${baseURL}`);
  }

  const data: any = await res.json().catch(() => null);
  if (!data) throw backendUnavailable("response body is not valid JSON");

  const token: string | undefined =
    data?.token || data?.access_token || data?.jwt || data?.data?.token;

  if (!token) throw backendUnavailable("login response contained no token");

  return { token, raw: data };
}

export async function POST(req: Request) {
  try {
    const { username, password, remember }: LoginBody = await req.json();

    // <-- ดึง raw (response data) ด้วย
    const { token: externalToken, raw } = await loginExternal(username, password);

    const claims = decodeExternalJwt<any>(externalToken) || {};

    const nowSec = Math.floor(Date.now() / 1000);
    if (typeof claims.exp === "number" && claims.exp + 300 < nowSec) {
      return NextResponse.json(
        { success: false, message: "External token expired" },
        { status: 401 }
      );
    }
    if (typeof claims.nbf === "number" && claims.nbf - 300 > nowSec) {
      return NextResponse.json(
        { success: false, message: "External token not yet valid" },
        { status: 401 }
      );
    }

    // ใช้ role code โดยตรงจาก backend
    const role_code = claims.role_code || claims.role || claims.user_role || "user";
    const role_id = Number(claims.role_id || claims.roleId || 0);
    const approval_level = Number(claims.approval_level || 0);

    // Validate role code
    if (!role_code || typeof role_code !== "string") {
      return NextResponse.json(
        { success: false, message: "สิทธิ์การใช้งานไม่ถูกต้อง (Missing role)" },
        { status: 403 }
      );
    }

    const userForOurJwt = {
      sub: (claims.sub as string) || claims.user_id || claims.id || username,
      username: (claims.username as string) || username,
      role: role_code.toLowerCase(),
      role_id,
      approval_level,
      name: (claims.name as string) || claims.fullname || username,
      org_id: claims.org_id || claims.organization_id || undefined,
      department_id: claims.department_id || claims.dept_id || undefined,
    };

    // ดึง refresh token จาก raw (response จาก external API)
    const externalRefreshToken: string | undefined =
      raw?.refresh_token || raw?.data?.refresh_token || undefined;

    // Cookie maxAge must reflect each token's own exp claim — api_token and
    // refresh_token are signed by the backend independently of anything the
    // frontend decides here.
    const apiTokenMaxAge = maxAgeFromJwt(externalToken, 3600);
    const refreshTokenMaxAge = maxAgeFromJwt(externalRefreshToken, 30 * 24 * 3600);

    const hours = (n: number) => n * 3600;
    const requested = remember ? hours(24 * 7) : hours(1);
    // Our own session wrapper must never outlive the refresh token backing it —
    // otherwise auth_token still verifies while the backend has no way to renew
    // the underlying api_token, and the user is stuck logged in with dead data.
    const expiretoken = Math.min(requested, refreshTokenMaxAge || requested);

    const ourJwt = await signUserToken(userForOurJwt, expiretoken);

    const res = NextResponse.json(
      { success: true, home: pickHomeByRole(role_code) },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );

    const isProd = process.env.NODE_ENV === "production";

    // เซ็ต auth_token (httpOnly)
    res.cookies.set("auth_token", ourJwt, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: expiretoken,
      priority: "high",
    });

    // เซ็ต api_token (non-httpOnly) ถ้าต้องให้ client-side ใช้งาน
    res.cookies.set("api_token", externalToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: apiTokenMaxAge,
      priority: "high",
    });

    // เซ็ต token_exp (readable by JS) เพื่อให้ SessionGuard อ่านเวลาหมดอายุได้ —
    // ต้องอ้างอิง exp จริงของ api_token ไม่ใช่ของ auth_token
    res.cookies.set("token_exp", String(Math.floor(Date.now() / 1000) + apiTokenMaxAge), {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: apiTokenMaxAge,
    });

    // เซ็ต refresh_token เป็น httpOnly cookie
    if (externalRefreshToken) {
      res.cookies.set("refresh_token", externalRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: refreshTokenMaxAge,
        priority: "high",
      });
    }

    return res;
  } catch (e: any) {
    // Only an explicit 401 is a credentials failure. Anything unexpected is a
    // server-side problem and must not be reported as "wrong password".
    const status = e?.status ?? 500;
    const message =
      status === 401
        ? "Invalid username or password"
        : e?.message || "เกิดข้อผิดพลาด";
    return NextResponse.json({ success: false, message }, { status });
  }
}

