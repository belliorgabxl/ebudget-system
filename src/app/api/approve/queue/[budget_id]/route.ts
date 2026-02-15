import { NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";

/**
 * GET /api/approve/queue/[budget_id]
 * Get approval queue details for a specific budget plan
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ budget_id: string }> }
) {
  const params = await context.params;
  
  try {
    console.log(`[GET /api/approve/queue/${params.budget_id}] Fetching approval queue`);

    const r = await nestGet<any>(
      `/approval-workflow/approval-queue/${encodeURIComponent(params.budget_id)}`
    );

    if (!r.success) {
      console.warn(
        `[GET /api/approve/queue/${params.budget_id}] Upstream error:`,
        r.message
      );
      return NextResponse.json(
        { success: false, message: r.message || "Failed to fetch" },
        { status: r.status ?? 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: r.data },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(
      `[GET /api/approve/queue/${params.budget_id}] Error:`,
      err
    );
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
