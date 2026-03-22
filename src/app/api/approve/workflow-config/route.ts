import { NextRequest, NextResponse } from "next/server";
import { nestGet, nestPost, nestPut } from "@/lib/server-api";

/**
 * GET /api/approve/workflow-config?organization_id=xxx
 * Check if workflow config exists for an organization
 */
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("organization_id");
  if (!orgId) {
    return NextResponse.json({ success: false, message: "organization_id required" }, { status: 400 });
  }
  const r = await nestGet<any>(`/approval-workflow-config/organization/${orgId}`);
  if (!r.success) {
    return NextResponse.json({ success: false, exists: false }, { status: 200 });
  }
  return NextResponse.json({ success: true, exists: true, data: r.data });
}

/**
 * POST /api/approve/workflow-config
 * Create or update (upsert) workflow config for an organization.
 * Body: { organization_id: string, levels: { level_number: number }[] }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { organization_id, levels } = body as {
    organization_id: string;
    levels: { level_number: number; department_required_id?: string; backup_user_id?: string }[];
  };

  if (!organization_id || !Array.isArray(levels) || levels.length === 0) {
    return NextResponse.json({ success: false, message: "organization_id and levels required" }, { status: 400 });
  }

  // Check if config already exists
  const existsRes = await nestGet<any>(`/approval-workflow-config/organization/${organization_id}`);

  if (existsRes.success) {
    // Update — deactivates old and creates new
    const r = await nestPut<any>(`/approval-workflow-config/bulk`, { organization_id, levels });
    if (!r.success) {
      return NextResponse.json({ success: false, message: r.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: r.data });
  } else {
    // Create new
    const r = await nestPost<any>(`/approval-workflow-config/bulk`, { organization_id, levels });
    if (!r.success) {
      return NextResponse.json({ success: false, message: r.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: r.data }, { status: 201 });
  }
}
