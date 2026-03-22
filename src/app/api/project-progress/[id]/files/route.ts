import { NextRequest, NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await nestGet<any>(`/project-progress/${id}/files`);
  if (!r.success) {
    return NextResponse.json({ success: false, message: r.message }, { status: 500 });
  }
  const payload = r.data as any;
  const files = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];
  return NextResponse.json({ success: true, data: files });
}
