import { NextRequest, NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await nestGet<any>(`/regular-work-templates/${id}/projects`);
  if (!r.success) {
    return NextResponse.json({ success: false, message: r.message ?? "Failed" }, { status: 500 });
  }
  const payload = (r.data as any) ?? {};
  const projects = payload.data ?? payload;
  const totalBudget = payload.total_budget ?? 0;
  return NextResponse.json({ success: true, data: projects, total_budget: totalBudget });
}
