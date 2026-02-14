import { NextResponse } from "next/server";
import { GetUsersByOrgFromApiServer } from "@/api/organization.server";

/**
 * GET /api/admin/organization/[org_id]
 * Get users by organization ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ org_id: string }> }
) {
  try {
    const { org_id } = await params;

    if (!org_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization ID is required",
        },
        { status: 400 }
      );
    }

    const result = await GetUsersByOrgFromApiServer(org_id);

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/organization/[org_id]] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}