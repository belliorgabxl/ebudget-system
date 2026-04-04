import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.API_BASE_URL!;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = cookies();
  const token = (await cookieStore).get("api_token")?.value;

  const contentType = req.headers.get("content-type") ?? "";
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let body: BodyInit;
  if (contentType.includes("multipart/form-data")) {
    // Forward multipart as-is (don't set Content-Type manually; fetch will set boundary)
    body = await req.formData();
  } else {
    headers["Content-Type"] = "application/json";
    body = await req.text().catch(() => "{}") || "{}";
  }

  const res = await fetch(`${BACKEND}/projects/${encodeURIComponent(id)}/close`, {
    method: "POST",
    headers,
    body,
  });

  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}
