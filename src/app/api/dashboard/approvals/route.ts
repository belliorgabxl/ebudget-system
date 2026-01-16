import { NextRequest, NextResponse } from "next/server";
import { GetApprovalQueueFromApiServer } from "@/api/dashboard.server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") || undefined;
    const departmentId = searchParams.get("department_id") || undefined;
    const status = searchParams.get("status") || undefined;

    const data = await GetApprovalQueueFromApiServer(year, departmentId, status);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("[API] GET /api/dashboard/approvals error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
