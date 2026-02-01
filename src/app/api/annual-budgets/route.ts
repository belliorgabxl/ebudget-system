import { NextResponse } from "next/server";
import { nestFetch, nestGet } from "@/lib/server-api";
import type {
  AnnualBudget,
  CreateAnnualBudgetRequest,
  UpdateAnnualBudgetRequest,
  GetAnnualBudgetsResponse,
} from "@/dto/annualBudgetDto";

/**
 * GET /api/annual-budgets
 * Fetch all annual budgets
 */
export async function GET() {
  try {
    const r = await nestGet<GetAnnualBudgetsResponse>("/annual-budgets");

    if (!r.success) {
      return NextResponse.json(
        { success: false, message: r.message ?? "Failed to fetch annual budgets" },
        { status: r.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true, data: r.data ?? [] });
  } catch (error) {
    console.error("Error fetching annual budgets:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/annual-budgets
 * Create new annual budget
 */
export async function POST(req: Request) {
  let payload: CreateAnnualBudgetRequest | null = null;

  try {
    payload = (await req.json()) as CreateAnnualBudgetRequest;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!payload?.amount || !payload?.fiscal_year) {
    return NextResponse.json(
      {
        success: false,
        message: "amount and fiscal_year are required",
      },
      { status: 400 }
    );
  }

  try {
    const r = await nestFetch<AnnualBudget>("/annual-budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.success) {
      return NextResponse.json(
        { success: false, message: r.message ?? "Failed to create annual budget" },
        { status: r.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true, data: r.data }, { status: 201 });
  } catch (error) {
    console.error("Error creating annual budget:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/annual-budgets
 * Update annual budget
 */
export async function PUT(req: Request) {
  let payload: UpdateAnnualBudgetRequest | null = null;

  try {
    payload = (await req.json()) as UpdateAnnualBudgetRequest;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!payload?.id || !payload?.amount || payload.fiscal_year === undefined) {
    return NextResponse.json(
      {
        success: false,
        message: "id, amount, and fiscal_year are required",
      },
      { status: 400 }
    );
  }

  try {
    const r = await nestFetch<AnnualBudget>("/annual-budgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.success) {
      return NextResponse.json(
        { success: false, message: r.message ?? "Failed to update annual budget" },
        { status: r.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true, data: r.data });
  } catch (error) {
    console.error("Error updating annual budget:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
