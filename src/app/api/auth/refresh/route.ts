import { NextRequest, NextResponse } from "next/server";

type RefreshResponse = {
  token?: string;
  access_token?: string;
  jwt?: string;
  refresh_token?: string;
};

function clearAuthCookies(res: NextResponse) {
  res.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
  res.cookies.set("api_token", "", { maxAge: 0, path: "/" });
  res.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
}

function setAuthCookies(res: NextResponse, args: { token: string; refreshToken?: string }) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set("auth_token", args.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  res.cookies.set("api_token", args.token, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  if (args.refreshToken) {
    res.cookies.set("refresh_token", args.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 30 * 24 * 3600,
    });
  }
}

async function callRefreshEndpoint(refreshToken: string) {
  const baseURL = process.env.API_BASE_URL || "";
  if (!baseURL) throw new Error("Missing API_BASE_URL");

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10_000);

  try {
    const r = await fetch(`${baseURL}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
      signal: controller.signal,
    });

    const data = (await r.json().catch(() => ({}))) as RefreshResponse;

    if (!r.ok) {
      return { ok: false as const, data };
    }

    return { ok: true as const, data };
  } finally {
    clearTimeout(t);
  }
}

async function handleRefresh(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    const redirectUrl = new URL("/login", req.url);
    const res = NextResponse.redirect(redirectUrl);
    clearAuthCookies(res);
    return res;
  }

  try {
    const { ok, data } = await callRefreshEndpoint(refreshToken);

    const newExternalToken = data?.token || data?.access_token || data?.jwt;
    const newRefreshToken = data?.refresh_token || refreshToken;

    if (!ok || !newExternalToken) {
      const redirectUrl = new URL("/login", req.url);
      const resFail = NextResponse.redirect(redirectUrl);
      clearAuthCookies(resFail);
      return resFail;
    }

    const res = NextResponse.json({ success: true });
    setAuthCookies(res, { token: newExternalToken, refreshToken: newRefreshToken });
    return res;
  } catch {
    const redirectUrl = new URL("/login", req.url);
    const resFail = NextResponse.redirect(redirectUrl);
    clearAuthCookies(resFail);
    return resFail;
  }
}

export async function POST(req: NextRequest) {
  return handleRefresh(req);
}

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect") || "/";

  const r = await handleRefresh(req);

  const isRedirect = r.headers.get("location");
  if (isRedirect) return r;

  const res = NextResponse.redirect(new URL(redirect, req.url));

  const setCookie = r.headers.get("set-cookie");
  if (setCookie) res.headers.append("set-cookie", setCookie);

  return res;
}
