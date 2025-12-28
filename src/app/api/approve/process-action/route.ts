import { NextRequest, NextResponse } from "next/server";
import { nestPost } from "@/lib/server-api";
import {
  ProcessApprovalActionRequest,
  ProcessApprovalActionResponse,
} from "@/dto/approveDto";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProcessApprovalActionRequest;
    if (!body?.action || !body?.budget_plan_id) {
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          message: "action and budget_plan_id are required",
        },
        { status: 400 }
      );
    }

    const r = await nestPost<ProcessApprovalActionResponse>(
      "/approval-workflow/process-action",
      body
    );
    

    return NextResponse.json(r, { status: 200 });
  } catch (err: any) {
    console.error("[process-approval-action] error", err);

    return NextResponse.json(
      {
        error: err?.error ?? "PROCESS_ACTION_FAILED",
        message: err?.message ?? "ไม่สามารถดำเนินการอนุมัติได้",
      },
      { status: err?.status ?? 500 }
    );
  }
}
