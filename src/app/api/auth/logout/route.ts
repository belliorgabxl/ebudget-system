import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true }, { status: 200 });

  const cookieOptions = { maxAge: 0, path: "/" };
  res.cookies.set("auth_token", "", cookieOptions);
  res.cookies.set("api_token", "", cookieOptions);
  res.cookies.set("refresh_token", "", cookieOptions);
  res.cookies.set("token_exp", "", cookieOptions);

  return res;
}
