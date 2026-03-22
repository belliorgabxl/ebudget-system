import { NextRequest, NextResponse } from "next/server";
import { nestDelete } from "@/lib/server-api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id, fileId } = await params;
  const r = await nestDelete<any>(`/project-progress/${id}/files/${fileId}`);
  if (!r.success) {
    return NextResponse.json({ success: false, message: r.message }, { status: r.status ?? 500 });
  }
  return NextResponse.json({ success: true });
}
