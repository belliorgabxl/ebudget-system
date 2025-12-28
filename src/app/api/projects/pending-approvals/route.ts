import { NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";
import { PendingApprovalProject } from "@/dto/approveDto";

export async function GET() {
  try {
    const r = await nestGet<PendingApprovalProject[]>(
      "/projects/pending-approvals"
    );

    return NextResponse.json(r, { status: r?.success ? 200 : 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, message, data: [] as PendingApprovalProject[] },
      { status: 500 }
    );
  }
}
