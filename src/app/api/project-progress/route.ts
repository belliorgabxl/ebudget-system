import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.API_BASE_URL!;

// Forward multipart/form-data (including file) directly to backend
export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("api_token")?.value;

  const formData = await req.formData();

  const res = await fetch(`${BACKEND}/project-progress`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}
