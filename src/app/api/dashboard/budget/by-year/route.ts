import { NextRequest, NextResponse } from "next/server";
import { GetBudgetByYearFromApiServer } from "@/api/dashboard.server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") || undefined;

    const data = await GetBudgetByYearFromApiServer(year);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("[API] GET /api/dashboard/budget/by-year error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
