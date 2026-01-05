import { NextRequest, NextResponse } from "next/server";
import { nestGet } from "@/lib/server-api";
import type { ProjectsListResponse } from "@/dto/dashboardDto";

type BackendProjectsResponse = Partial<ProjectsListResponse> & {
  data?: any;
};

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  const path = qs ? `/projects?${qs}` : "/projects";

  const r = await nestGet<any>(path);

  if (!r.success) {
    return NextResponse.json(
      { success: false, message: r.message, data: null },
      { status: 400 }
    );
  }

  const body = (r.data ?? {}) as BackendProjectsResponse;

  const data = Array.isArray(body.data)
    ? body.data
    : body.data
    ? [body.data]
    : [];

  const pagination = body.pagination ?? {
    has_next: false,
    has_prev: false,
    limit: Number(body.limit ?? 10),
    page: Number(body.page ?? 1),
    total: Number(body.total ?? data.length),
    total_pages: Number(body.total_pages ?? 1),
  };

  const out: ProjectsListResponse = {
    data,
    page: Number(body.page ?? pagination.page ?? 1),
    limit: Number(body.limit ?? pagination.limit ?? 10),
    total: Number(body.total ?? pagination.total ?? data.length),
    total_pages: Number(body.total_pages ?? pagination.total_pages ?? 1),
    pagination: {
      has_next: !!pagination.has_next,
      has_prev: !!pagination.has_prev,
      limit: Number(pagination.limit ?? 10),
      page: Number(pagination.page ?? 1),
      total: Number(pagination.total ?? data.length),
      total_pages: Number(pagination.total_pages ?? 1),
    },
  };

  return NextResponse.json({ success: true, data: out }, { status: 200 });
}
