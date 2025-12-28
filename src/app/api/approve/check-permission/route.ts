import { NextRequest, NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";

export async function GET(req: NextRequest) {
  try {
    const budgetPlanId = req.nextUrl.searchParams.get("budget_plan_id");
    if (!budgetPlanId) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "budget_plan_id is required" },
        { status: 400 }
      );
    }
    const data = await nestGet<boolean>(
      `/approval-workflow/check-permission?budget_plan_id=${encodeURIComponent(
        budgetPlanId
      )}`
    );

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    const status = err?.status ?? 500;
    return NextResponse.json(
      {
        error: err?.error ?? "REQUEST_FAILED",
        message: err?.message ?? "Failed to check permission",
      },
      { status }
    );
  }
}
