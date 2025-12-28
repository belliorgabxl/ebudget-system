import {
  PendingApprovalsEnvelope,
  PendingApprovalsParams,
} from "@/dto/approveDto";
import type {
  ProjectInformationResponse,
  ProjectListItem,
} from "@/dto/projectDto";
import { nestGet } from "@/lib/server-api";
import { mapStatusToIsActive } from "@/lib/util";
import { redirect } from "next/navigation";

export async function fetchProjectInformationServer(projectId: string) {
  const r = await nestGet<ProjectInformationResponse>(
    `/projects/information?project_id=${encodeURIComponent(projectId)}`
  );

  if (!r.success)
    throw new Error(r.message ?? "Failed to fetch project information");
  return r.data;
}

type GetProjectsQuery = {
  q?: string;
  status?: string;
  page?: string;
  limit?: string;
  name?: string;
  code?: string;
  plan_type?: string;
  is_active?: string;
  department_id?: string;
  start_date?: string;
};

export async function getProjectsServer(
  params: GetProjectsQuery
): Promise<ProjectListItem[]> {
  const qs = new URLSearchParams();

  const page = params.page ?? "1";
  const limit = params.limit ?? "20";
  qs.set("page", page);
  qs.set("limit", limit);

  const name = (params.name ?? params.q ?? "").trim();
  if (name) qs.set("name", name);

  const code = (params.code ?? "").trim();
  if (code) qs.set("code", code);

  const planType = (params.plan_type ?? "").trim();
  if (planType) qs.set("plan_type", planType);

  const deptId = (params.department_id ?? "").trim();
  if (deptId) qs.set("department_id", deptId);

  const startDate = (params.start_date ?? "").trim();
  if (startDate) qs.set("start_date", startDate);

  const isActive =
    (params.is_active ?? "").trim() || mapStatusToIsActive(params.status);
  if (isActive === "true" || isActive === "false") {
    qs.set("is_active", isActive);
  }

  const r = await nestGet<unknown>(`/projects?${qs.toString()}`);

  if (!r.success && r.status === 401) {
    redirect("/login");
  }

  if (!r.success) {
    console.error("getProjectsServer error:", r.status, r.message);
    return [];
  }

  const raw = r.data;
  if (Array.isArray(raw)) return raw as ProjectListItem[];
  if (raw && typeof raw === "object") {
    const obj = raw as any;
    if (Array.isArray(obj.data)) return obj.data as ProjectListItem[];
    if (Array.isArray(obj.items)) return obj.items as ProjectListItem[];
    if (Array.isArray(obj.results)) return obj.results as ProjectListItem[];
  }

  return [];
}

export async function getPendingApprovalsServer(
  sp: PendingApprovalsParams
): Promise<PendingApprovalsEnvelope> {
  const params = new URLSearchParams();

  if (sp.q?.trim()) params.set("q", sp.q.trim());
  if (sp.code?.trim()) params.set("code", sp.code.trim());
  if (sp.plan_type?.trim()) params.set("plan_type", sp.plan_type.trim());

  params.set("page", String(Number(sp.page ?? "1") || 1));
  params.set("limit", String(Number(sp.limit ?? "10") || 10));

  const qs = params.toString();
  const r = await nestGet<PendingApprovalsEnvelope>(
    `/projects/pending-approvals${qs ? `?${qs}` : ""}`
  );

  if (!r.success) {
    console.error("[getPendingApprovalsServer] failed", { message: r.message });
    return {
      data: [],
      total: 0,
      pagination: {
        page: 1,
        limit: Number(sp.limit ?? "10") || 10,
        total: 0,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    };
  }

  return (
    r.data ?? {
      data: [],
      total: 0,
      pagination: {
        page: 1,
        limit: Number(sp.limit ?? "10") || 10,
        total: 0,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    }
  );
}
