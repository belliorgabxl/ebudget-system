import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.API_BASE_URL!;

// PATCH: update an existing progress record (multipart, same as POST)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = cookies();
  const token = (await cookieStore).get("api_token")?.value;

  const formData = await req.formData();

  const res = await fetch(`${BACKEND}/project-progress/${id}`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}

// DELETE: delete a progress record
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = cookies();
  const token = (await cookieStore).get("api_token")?.value;

  const res = await fetch(`${BACKEND}/project-progress/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}
