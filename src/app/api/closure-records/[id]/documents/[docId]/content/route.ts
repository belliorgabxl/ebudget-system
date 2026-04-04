import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.API_BASE_URL!;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params;
  const token = (await cookies()).get("api_token")?.value;
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const fileRes = await fetch(
    `${BACKEND}/closure-records/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}/stream`,
    { headers: authHeader, cache: "no-store" }
  );

  if (!fileRes.ok) {
    return NextResponse.json(
      { success: false, message: "ไม่พบไฟล์" },
      { status: fileRes.status === 404 ? 404 : 502 }
    );
  }

  const contentType =
    fileRes.headers.get("content-type") ?? "application/octet-stream";
  const body = await fileRes.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition":
        fileRes.headers.get("content-disposition") ?? "inline",
      "Cache-Control": "private, max-age=600",
    },
  });
}
