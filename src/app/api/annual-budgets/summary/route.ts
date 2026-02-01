import { NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";
import type { GetAnnualBudgetSummaryResponse } from "@/dto/annualBudgetDto";

/**
 * GET /api/annual-budgets/summary
 * Fetch annual budget summary
 */
export async function GET() {
  try {
    const r = await nestGet<GetAnnualBudgetSummaryResponse>(
      "/annual-budgets/summary"
    );

    if (!r.success) {
      return NextResponse.json(
        {
          success: false,
          message: r.message ?? "Failed to fetch annual budget summary",
        },
        { status: r.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true, data: r.data });
  } catch (error) {
    console.error("Error fetching annual budget summary:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
