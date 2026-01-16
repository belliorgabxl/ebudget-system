import { NextRequest, NextResponse } from "next/server";
import { GetDashboardKPIFromApiServer } from "@/api/dashboard.server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");

    if (!year) {
      return NextResponse.json(
        { success: false, message: "Year parameter is required" },
        { status: 400 }
      );
    }

    const data = await GetDashboardKPIFromApiServer(year);

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch KPI data" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("[API] GET /api/dashboard/kpi error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
