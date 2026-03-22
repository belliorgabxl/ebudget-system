import { NextRequest, NextResponse } from "next/server";
import { nestGet, nestPost } from "@/lib/server-api";
import type { RegularWorkTemplate } from "@/dto/projectDto";

type ListResponse = {
  data: RegularWorkTemplate[];
  total: number;
  page: number;
  limit: number;
};

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  const path = qs
    ? `/regular-work-templates/organization?${qs}`
    : "/regular-work-templates/organization";

  const r = await nestGet<ListResponse>(path);

  if (!r.success) {
    return NextResponse.json(
      { success: false, message: r.message ?? "Failed to fetch regular work templates" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: r.data?.data ?? [],
    total: r.data?.total ?? 0,
    page: r.data?.page ?? 1,
    limit: r.data?.limit ?? 10,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const r = await nestPost<RegularWorkTemplate>("/regular-work-templates", body);

  if (!r.success) {
    return NextResponse.json(
      { success: false, message: r.message ?? "Failed to create regular work template" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: r.data }, { status: 201 });
}

