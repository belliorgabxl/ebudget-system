import { NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";

export async function GET() {
  const r = await nestGet("/organization-quota");
  if (!r.success) {
    return NextResponse.json(
      { success: false, message: r.message ?? "Failed to fetch quota" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, data: r.data });
}
