import { NextResponse } from "next/server";
import { decodeExternalJwt, signUserToken } from "@/lib/auth";
import { pickHomeByRole } from "@/lib/rbac";

type LoginBody = { username: string; password: string; remember?: boolean };

function pickSafeMessage(data: any) {
  return data?.message || data?.error || "";
}

async function loginExternal(username: string, password: string) {
  const baseURL = process.env.API_BASE_URL;
  if (!baseURL) throw new Error("Missing API_BASE_URL");

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
    const e = new Error("External login failed");
    (e as any).status = 502;
    throw e;
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

    const e = new Error(safe);
    (e as any).status = res.status || 502;
    throw e;
  }

  const data: any = await res.json().catch(() => ({}));

  const token: string | undefined =
    data?.token || data?.access_token || data?.jwt || data?.data?.token;

  if (!token) throw new Error("No token returned from external API");

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

    const hours = (n: number) => n * 3600;
    const expiretoken = remember ? hours(24 * 7) : hours(1);

    const ourJwt = await signUserToken(userForOurJwt, expiretoken);

    const res = NextResponse.json(
      { success: true, home: pickHomeByRole(role_code) },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );

    const isProd = process.env.NODE_ENV === "production";

    // ดึง refresh token จาก raw (response จาก external API)
    const externalRefreshToken = raw?.refresh_token || raw?.data?.refresh_token || undefined;

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
      maxAge: expiretoken,
      priority: "high",
    });

    // เซ็ต refresh_token เป็น httpOnly cookie (ตัวอย่าง 30 วัน)
    const refreshMaxAge = 30 * 24 * 3600; // 30 days in seconds
    if (externalRefreshToken) {
      res.cookies.set("refresh_token", externalRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: refreshMaxAge,
        priority: "high",
      });
    }

    return res;
  } catch (e: any) {
    const status = e?.status ?? 401;
    const message =
      status === 401
        ? "Invalid username or password"
        : e?.message || "เกิดข้อผิดพลาด";
    return NextResponse.json({ success: false, message }, { status });
  }
}

