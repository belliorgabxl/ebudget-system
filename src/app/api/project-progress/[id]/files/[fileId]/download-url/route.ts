import { NextRequest, NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id, fileId } = await params;
  const r = await nestGet<any>(`/project-progress/${id}/files/${fileId}/download-url`);
  if (!r.success) {
    return NextResponse.json({ success: false, message: r.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: r.data });
}
