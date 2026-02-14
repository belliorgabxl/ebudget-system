import { NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";
import type { RoleRespond } from "@/dto/roleDto";

/**
 * GET /api/roles/by-org
 * Get roles by organization ID (for admin use)
 * Query parameter: organization_id
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organization_id = searchParams.get("organization_id");

    if (!organization_id) {
      return NextResponse.json(
        { success: false, message: "organization_id is required" },
        { status: 400 }
      );
    }

    // Call backend with organization_id parameter
    const url = `/roles/by-org?organization_id=${encodeURIComponent(organization_id)}`;
    const r = await nestGet<{ data?: RoleRespond | RoleRespond[] }>(url);

    if (!r.success) {
      return NextResponse.json(
        { success: false, message: r.message },
        { status: 400 }
      );
    }

    const payload = r.data?.data;
    const list = Array.isArray(payload)
      ? payload
      : payload
      ? [payload]
      : [];

    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    console.error("[GET /api/roles/by-org] Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
