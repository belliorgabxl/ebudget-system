import { NextRequest, NextResponse } from "next/server";
import { nestPut } from "@/lib/server-api";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const r = await nestPut<any>("/projects/kpis", body);
  if (!r.success) {
    return NextResponse.json({ success: false, message: r.message ?? "Failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: r.data });
}
