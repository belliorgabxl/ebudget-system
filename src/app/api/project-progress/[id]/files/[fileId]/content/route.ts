import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.API_BASE_URL!;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id, fileId } = await params;
  const token = (await cookies()).get("api_token")?.value;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  // Stream file bytes through Go backend (server-to-server, stays inside Docker network).
  // Go backend fetches from MinIO internally (172.19.0.10:9000) and pipes bytes back.
  // This avoids needing MinIO to be publicly accessible.
  const fileRes = await fetch(
    `${BACKEND}/project-progress/${id}/files/${fileId}/stream`,
    { headers: authHeader, cache: "no-store" }
  );

  if (!fileRes.ok) {
    const status = fileRes.status === 404 ? 404 : 502;
    return NextResponse.json({ success: false, message: "ไม่พบไฟล์" }, { status });
  }

  const contentType = fileRes.headers.get("content-type") ?? "application/pdf";
  const body = await fileRes.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": fileRes.headers.get("content-disposition") ?? "inline",
      "Cache-Control": "private, max-age=600",
    },
  });
}
