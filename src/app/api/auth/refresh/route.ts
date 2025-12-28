import { NextRequest, NextResponse } from "next/server";
import ApiClient from "@/lib/api-clients";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const isProd = process.env.NODE_ENV === "production";

  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    const redirectUrl = new URL("/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const baseURL = process.env.API_BASE_URL || "";
    const res = await ApiClient.post(
      "/auth/refresh",
      { refresh_token: refreshToken },
      { baseURL, timeout: 10000 }
    );

    const data: any = res?.data ?? {};

    const newExternalToken = data?.token || data?.access_token || data?.jwt;
    const newRefreshToken = data?.refresh_token || refreshToken;

    const response = NextResponse.json({ success: true });

    response.cookies.set("auth_token", newExternalToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    response.cookies.set("api_token", newExternalToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60,
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
    const redirectUrl = new URL("/login", req.url);
    const resFail = NextResponse.redirect(redirectUrl);
    resFail.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
    resFail.cookies.set("api_token", "", { maxAge: 0, path: "/" });
    resFail.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
    return resFail;
  }
}

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect") || "/";

  const apiRefreshUrl = new URL("/api/auth/refresh", req.url);

  const r = await fetch(apiRefreshUrl.toString(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
  });
  if (!r.ok) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("auth_token");
    res.cookies.delete("api_token");
    res.cookies.delete("refresh_token");
    return res;
  }
  const res = NextResponse.redirect(new URL(redirect, req.url));
  const setCookie = r.headers.get("set-cookie");
  if (setCookie) res.headers.append("set-cookie", setCookie);

  return res;
}
