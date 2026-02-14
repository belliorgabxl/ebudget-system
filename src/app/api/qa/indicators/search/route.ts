import { NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";

/**
 * GET /api/qa/indicators/search
 * Search QA indicators by name or code
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nameCode = searchParams.get("NameCode") || "";

    console.log("[GET /api/qa/indicators/search] Searching with NameCode:", nameCode);

    if (!nameCode.trim()) {
      return NextResponse.json(
        { success: false, message: "NameCode parameter is required" },
        { status: 400 }
      );
    }

    const r = await nestGet<any>(
      `/qa-indicators/organization/search?NameCode=${encodeURIComponent(nameCode)}`
    );

    if (!r.success) {
      console.warn("[GET /api/qa/indicators/search] Upstream error:", r.message);
      return NextResponse.json(
        { success: false, message: r.message || "Search failed" },
        { status: r.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true, data: r.data }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/qa/indicators/search] Error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
