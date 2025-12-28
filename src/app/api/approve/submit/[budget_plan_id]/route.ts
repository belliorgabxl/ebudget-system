import { NextRequest, NextResponse } from "next/server";
import { nestPost } from "@/lib/server-api";

type RouteParams = Promise<{ budget_plan_id: string }>;

export async function POST(
  _req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { budget_plan_id } = await params;

    const data = await nestPost(
      `/approval-workflow/submit/${encodeURIComponent(budget_plan_id)}`
    );

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    const status = err?.status ?? 500;

    return NextResponse.json(
      {
        error: err?.error ?? "REQUEST_FAILED",
        message: err?.message ?? "ไม่สามารถส่งอนุมัติได้",
      },
      { status }
    );
  }
}
