import { NextResponse } from "next/server";
import { nestFetch } from "@/lib/server-api";

export type UpdateBudgetPlanItem = {
  id: number;
  name: string;
  amount: number;
  remark: string;
};

export type UpdateBudgetPlanPayload = {
  project_id: string;
  budget_amount: number;
  budget_items: UpdateBudgetPlanItem[];
  budget_source: string;
  budget_source_department: string;
};

export async function PUT(req: Request) {
  let payload: UpdateBudgetPlanPayload | null = null;

  try {
    payload = (await req.json()) as UpdateBudgetPlanPayload;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!payload?.project_id) {
    return NextResponse.json(
      { success: false, message: "project_id is required" },
      { status: 400 }
    );
  }

  const r = await nestFetch<{ message: string }>(
    "/budget-plans/update-by-project",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!r.success) {
    return NextResponse.json(
      { success: false, message: r.message ?? "Update budget plan failed" },
      { status: r.status ?? 400 }
    );
  }

  return NextResponse.json({ success: true, data: r.data });
}
