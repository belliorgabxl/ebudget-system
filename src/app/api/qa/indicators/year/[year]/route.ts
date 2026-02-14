import { NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";

/**
 * GET /api/qa/indicators/year/[year]
 * Get paginated QA indicators for a specific year
 */
export async function GET(req: Request, { params }: { params: { year: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    console.log(`[GET /api/qa/indicators/year/${params.year}] page=${page}, limit=${limit}`);

    const r = await nestGet<any>(
      `/qa-indicators/organization/year/${params.year}?page=${page}&limit=${limit}`
    );

    if (!r.success) {
      console.warn(`[GET /api/qa/indicators/year/${params.year}] Upstream error:`, r.message);
      return NextResponse.json(
        { success: false, message: r.message || "Failed to fetch" },
        { status: r.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true, data: r.data }, { status: 200 });
  } catch (err: any) {
    console.error(`[GET /api/qa/indicators/year/${params.year}] Error:`, err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
