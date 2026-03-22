import { NextRequest, NextResponse } from "next/server";
import { nestGet, nestDelete, nestPatch } from "@/lib/server-api";
import type { RegularWorkTemplate } from "@/dto/projectDto";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await nestGet<RegularWorkTemplate>(`/regular-work-templates/${id}`);

  if (!r.success) {
    return NextResponse.json(
      { success: false, message: r.message ?? "Not found" },
      { status: 404 }
    );
  }

  const payload = r.data as any;
  const template = payload?.data ?? payload;
  return NextResponse.json({ success: true, data: template });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await nestDelete(`/regular-work-templates/${id}`);
  if (!r.success) {
    return NextResponse.json({ success: false, message: r.message ?? "Failed to delete" }, { status: 409 });
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await nestPatch(`/regular-work-templates/${id}/toggle-status`, {});
  if (!r.success) {
    return NextResponse.json({ success: false, message: r.message ?? "Failed" }, { status: 409 });
  }
  return NextResponse.json({ success: true, data: r.data });
}
