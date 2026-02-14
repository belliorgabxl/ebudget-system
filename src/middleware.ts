import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { pickHomeByRole } from "@/lib/rbac";

const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/forgot-password",
  "/403",
  "/auth/refresh",
]);
const PUBLIC_PREFIXES: string[] = [];

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("Missing JWT_SECRET");
const JWT_SECRET = new TextEncoder().encode(secret);

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p + "/"));
}

function pathStarts(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(base + "/");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value ?? null;

  if (isPublicPath(pathname)) {
    if (pathname !== "/403" && pathname !== "/auth/refresh" && token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = typeof payload.role === "string" ? payload.role : "";
        if (role) {
          const homeUrl = new URL(pickHomeByRole(role), request.url);
          return NextResponse.redirect(homeUrl);
        }
      } catch {}
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + (search || ""));
    return NextResponse.redirect(loginUrl);
  }

  let payload: any;
  try {
    ({ payload } = await jwtVerify(token, JWT_SECRET));
  } catch (err) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + (search || ""));

    const res = NextResponse.redirect(loginUrl);

    res.cookies.delete("auth_token");
    res.cookies.delete("api_token");
  }

  const role = payload.role;
  const approval_level = payload.approval_level || 0;
  
  if (!role) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("auth_token");
    res.cookies.delete("api_token");
    return res;
  }

  const forbid = () => NextResponse.redirect(new URL("/403", request.url));

  // /organizer/dashboard/user - สำหรับ role นอกเหนือจาก hr, director, admin
  if (pathStarts(pathname, "/organizer/dashboard/user")) {
    if (["hr", "director", "admin"].includes(role)) return forbid();
  }
  
  // /organizer/dashboard/hr - สำหรับ role code "hr"
  if (pathStarts(pathname, "/organizer/dashboard/hr") && role !== "hr") {
    return forbid();
  }
  
  // /organizer/dashboard/director - สำหรับ role code "director"
  if (pathStarts(pathname, "/organizer/dashboard/director") && role !== "director") {
    return forbid();
  }

  // /organizer/qa-coverage - สำหรับ director
  if (pathStarts(pathname, "/organizer/qa-coverage") && role !== "director") {
    return forbid();
  }

  // /organizer/projects/my-project - ห้าม hr, admin
  if (pathStarts(pathname, "/organizer/projects/my-project")) {
    if (["hr", "admin"].includes(role)) return forbid();
  }

  // /organizer/approve/ - สำหรับคนที่มี approval_level > 0
  if (pathStarts(pathname, "/organizer/approve/")) {
    if (approval_level <= 0) return forbid();
  }

  // /organizer/reports/ - ห้าม hr, admin, planning
  if (pathStarts(pathname, "/organizer/reports/")) {
    if (["hr", "admin", "planning"].includes(role)) return forbid();
  }

  // /organizer/department - ต้องเป็น hr หรือ admin
  if (pathStarts(pathname, "/organizer/department")) {
    if (!["hr", "admin"].includes(role)) return forbid();
  }

  // /admin - ต้องเป็น admin
  if (pathStarts(pathname, "/admin") && role !== "admin") {
    return forbid();
  }

  const headers = new Headers(request.headers);
  if (payload.sub) headers.set("x-user-id", payload.sub);
  if (payload.role) headers.set("x-user-role", payload.role);
  if (payload.name) headers.set("x-user-name", payload.name);
  if (payload.org_id) headers.set("x-org-id", payload.org_id);
  if (payload.department_id) headers.set("x-dept-id", payload.department_id);
  if (payload.approval_level !== undefined) headers.set("x-approval-level", String(payload.approval_level));

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)|api).*)",
  ],
};
