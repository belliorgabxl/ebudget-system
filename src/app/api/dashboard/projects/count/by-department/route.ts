import { NextRequest, NextResponse } from "next/server";
import { GetProjectCountByDepartmentFromApiServer } from "@/api/dashboard.server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") || undefined;

    const data = await GetProjectCountByDepartmentFromApiServer(year);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("[API] GET /api/dashboard/projects/count/by-department error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
