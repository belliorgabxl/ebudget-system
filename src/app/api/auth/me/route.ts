import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { authenticated: false, message: "Unauthenticated" },
      { status: 401 }
    );
  }

  // Return user data in flat format
  return NextResponse.json({
    authenticated: true,
    id: user.sub,
    organization_id: user.org_id ?? null,
    department_id: user.department_id ?? null,
    department_name: null, // TODO: Fetch from department API if needed
    is_active: true, // TODO: Add is_active to user claims if needed
    role: user.role ?? null,
    role_code: user.role ?? null,
    approval_level: user.approval_level ?? 0,
    username: user.username,
    email: null, // TODO: Add email to user claims if needed
    position: null, // TODO: Add position to user claims if needed
    first_name: null, // TODO: Add first_name to user claims if needed
    last_name: null, // TODO: Add last_name to user claims if needed
    full_name: user.name ?? user.username,
    last_login_at: null, // TODO: Add last_login_at to user claims if needed
  });
}
