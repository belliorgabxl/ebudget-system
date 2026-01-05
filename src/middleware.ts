import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { pickHomeByRole } from "@/lib/rbac";

function getLocalFromPath(pathname: string): string | null {
  const seg = pathname.split("/")[1];
  return seg || null;
}

function stripLocal(pathname: string, local: string | null): string {
  if (!local) return pathname;
  if (pathname === `/${local}`) return "/";
  if (pathname.startsWith(`/${local}/`)) {
    return pathname.slice(local.length + 1);
  }
  return pathname;
}

function withLocal(path: string, local: string | null): string {
  if (!local) return path;
  if (path === "/") return `/${local}`;
  return `/${local}${path}`;
}

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
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function pathStarts(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(base + "/");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const local = getLocalFromPath(pathname);
  const logicalPath = stripLocal(pathname, local);

  const token = request.cookies.get("auth_token")?.value ?? null;

  if (isPublicPath(logicalPath)) {
    if (logicalPath !== "/403" && logicalPath !== "/auth/refresh" && token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = typeof payload.role === "string" ? payload.role : "";
        if (role) {
          const home = withLocal(pickHomeByRole(role), local);
          return NextResponse.redirect(new URL(home, request.url));
        }
      } catch {}
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL(withLocal("/login", local), request.url);
    loginUrl.searchParams.set(
      "redirect",
      withLocal(logicalPath + (search || ""), local)
    );
    return NextResponse.redirect(loginUrl);
  }

  let payload: any;
  try {
    ({ payload } = await jwtVerify(token, JWT_SECRET));
  } catch {
    const loginUrl = new URL(withLocal("/login", local), request.url);
    loginUrl.searchParams.set(
      "redirect",
      withLocal(logicalPath + (search || ""), local)
    );

    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("auth_token");
    res.cookies.delete("api_token");
    res.cookies.delete("refresh_token");
    return res;
  }

  const role = payload.role;
  if (!role) {
    const res = NextResponse.redirect(
      new URL(withLocal("/login", local), request.url)
    );
    res.cookies.delete("auth_token");
    res.cookies.delete("api_token");
    res.cookies.delete("refresh_token");
    return res;
  }

  const forbid = () =>
    NextResponse.redirect(new URL(withLocal("/403", local), request.url));

  if (
    pathStarts(logicalPath, "/organizer/dashboard/user") &&
    !["department_user", "planning", "department_head", "director"].includes(
      role
    )
  )
    return forbid();

  if (pathStarts(logicalPath, "/organizer/dashboard/hr") && role !== "hr")
    return forbid();

  if (
    pathStarts(logicalPath, "/organizer/dashboard/director") &&
    role !== "director"
  )
    return forbid();

  if (pathStarts(logicalPath, "/organizer/qa-coverage") && role !== "director")
    return forbid();

  if (pathStarts(logicalPath, "/organizer/projects/my-project")) {
    if (["hr", "admin"].includes(role)) return forbid();
  }

  if (pathStarts(logicalPath, "/organizer/approve/")) {
    if (["hr", "admin", "planning"].includes(role)) return forbid();
  }

  if (pathStarts(logicalPath, "/organizer/reports/")) {
    if (["hr", "admin", "planning"].includes(role)) return forbid();
  }

  if (pathStarts(logicalPath, "/organizer/department")) {
    if (!["hr", "admin"].includes(role)) return forbid();
  }

  if (pathStarts(logicalPath, "/admin") && role !== "admin") return forbid();

  const headers = new Headers(request.headers);
  if (payload.sub) headers.set("x-user-id", payload.sub);
  if (payload.role) headers.set("x-user-role", payload.role);
  if (payload.name) headers.set("x-user-name", payload.name);
  if (payload.org_id) headers.set("x-org-id", payload.org_id);
  if (payload.department_id) headers.set("x-dept-id", payload.department_id);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)|api).*)",
  ],
};
