import { NextRequest, NextResponse } from "next/server";
import { nestGet, nestPatch } from "@/lib/server-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id } = await params;
  const r = await nestGet(`/organization-quota/${org_id}`);
  if (!r.success) {
    return NextResponse.json(
      { success: false, message: r.message ?? "Failed to fetch quota" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, data: (r.data as any)?.data ?? r.data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ org_id: string }> }
) {
  const { org_id } = await params;
  const body = await req.json();

  // Determine which quota field to update
  if ("max_users" in body) {
    const r = await nestPatch(`/organization-quota/${org_id}/max-users`, { max_users: body.max_users });
    if (!r.success) {
      return NextResponse.json({ success: false, message: r.message ?? "Failed to update max users" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  if ("max_storage_bytes" in body) {
    const r = await nestPatch(`/organization-quota/${org_id}/max-storage`, { max_storage_bytes: body.max_storage_bytes });
    if (!r.success) {
      return NextResponse.json({ success: false, message: r.message ?? "Failed to update max storage" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, message: "No quota field specified" }, { status: 400 });
}
