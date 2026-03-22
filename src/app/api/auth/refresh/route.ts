import { NextRequest, NextResponse } from "next/server";
import ApiClient from "@/lib/api-clients";
import { decodeExternalJwt, signUserToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";

  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ success: false, message: "No refresh token" }, { status: 401 });
  }

  try {
    const baseURL = process.env.API_BASE_URL || "";
    const res = await ApiClient.post(
      "/auth/refresh",
      { refresh_token: refreshToken },
      { baseURL, timeout: 10000 }
    );

    const data: any = res?.data ?? {};

    const newExternalToken: string = data?.token || data?.access_token || data?.jwt;
    const newRefreshToken: string = data?.refresh_token || refreshToken;

    if (!newExternalToken) {
      return NextResponse.json({ success: false, message: "No token returned" }, { status: 401 });
    }

    // Decode the backend token to rebuild our frontend JWT (same as login)
    const claims = decodeExternalJwt<any>(newExternalToken) || {};
    const role_code = claims.role_code || claims.role || claims.user_role || "user";
    const role_id = Number(claims.role_id || claims.roleId || 0);
    const approval_level = Number(claims.approval_level || 0);

    const userForOurJwt = {
      sub: (claims.sub as string) || claims.user_id || claims.id || "",
      username: (claims.username as string) || "",
      role: role_code.toLowerCase(),
      role_id,
      approval_level,
      name: (claims.name as string) || claims.fullname || "",
      org_id: claims.org_id || claims.organization_id || undefined,
      department_id: claims.department_id || claims.dept_id || undefined,
    };

    // Sign new frontend JWT valid for 1 hour
    const TTL = 60 * 60;
    const ourJwt = await signUserToken(userForOurJwt, TTL);

    const response = NextResponse.json({ success: true });

    // token_exp readable by JS so SessionGuard can detect approaching expiry
    response.cookies.set("token_exp", String(Math.floor(Date.now() / 1000) + TTL), {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: TTL,
    });

    response.cookies.set("auth_token", ourJwt, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: TTL,
    });

    response.cookies.set("api_token", newExternalToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: TTL,
    });

    if (newRefreshToken) {
      response.cookies.set("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 30 * 24 * 3600,
      });
    }

    return response;
  } catch (err: any) {
    // Refresh failed — clear all tokens
    const resFail = NextResponse.json({ success: false, message: "Refresh failed" }, { status: 401 });
    resFail.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
    resFail.cookies.set("api_token", "", { maxAge: 0, path: "/" });
    resFail.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
    return resFail;
  }
}

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect") || "/";

  // Forward cookies from incoming request so POST can read them
  const cookieHeader = req.headers.get("cookie") || "";
  const apiRefreshUrl = new URL("/api/auth/refresh", req.url);

  const r = await fetch(apiRefreshUrl.toString(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: cookieHeader,
    },
  });

  if (!r.ok) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
    res.cookies.set("api_token", "", { maxAge: 0, path: "/" });
    res.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
    return res;
  }

  const res = NextResponse.redirect(new URL(redirect, req.url));
  const setCookie = r.headers.get("set-cookie");
  if (setCookie) res.headers.append("set-cookie", setCookie);
  return res;
}

