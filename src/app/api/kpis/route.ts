import { NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";

export async function GET() {
  const r = await nestGet<any>("/kpis/organizations?limit=200&offset=0");
  if (!r.success) {
    return NextResponse.json({ success: false, message: r.message ?? "Failed" }, { status: 500 });
  }
  const payload = r.data as any;
  // Backend returns { data: [{id, indicator, target_value, description}], total, ... }
  // Map to KpiMaster[] shape: { id, name, type }
  const items: any[] = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  const kpiMasters = items.map((k: any) => ({
    id: k.id,
    name: k.indicator ?? k.name ?? "",
    type: k.type ?? "output",
  }));
  return NextResponse.json(kpiMasters);
}
