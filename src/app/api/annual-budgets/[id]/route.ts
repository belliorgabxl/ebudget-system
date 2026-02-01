import { NextResponse } from "next/server";
import { nestFetch, nestGet } from "@/lib/server-api";
import type { AnnualBudget } from "@/dto/annualBudgetDto";

/**
 * GET /api/annual-budgets/[id]
 * Fetch annual budget by ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { success: false, message: "Invalid budget ID" },
      { status: 400 }
    );
  }

  try {
    const r = await nestGet<AnnualBudget>(`/annual-budgets/${id}`);

    if (!r.success) {
      return NextResponse.json(
        { success: false, message: r.message ?? "Failed to fetch annual budget" },
        { status: r.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true, data: r.data });
  } catch (error) {
    console.error("Error fetching annual budget:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/annual-budgets/[id]
 * Delete annual budget
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { success: false, message: "Invalid budget ID" },
      { status: 400 }
    );
  }

  try {
    const r = await nestFetch<{ message: string }>(
      `/annual-budgets/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!r.success) {
      return NextResponse.json(
        { success: false, message: r.message ?? "Failed to delete annual budget" },
        { status: r.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Annual budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting annual budget:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
