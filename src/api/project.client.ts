import type { GetCalenderEventRespond } from "@/dto/dashboardDto";
import type {
  CreateProjectPayload,
  CreateProjectResponse,
} from "@/dto/createProjectDto";
import { clientFetch } from "@/lib/client-api";
import { GeneralInfoForUpdateData, ProjectListItem } from "@/dto/projectDto";
import { normalizeDateOnly } from "@/lib/helper";

export async function getCalendarEvents(): Promise<GetCalenderEventRespond[]> {
  const r = await clientFetch<GetCalenderEventRespond[]>(
    "/api/projects/calendar-events",
    {
      cache: "no-store",
    }
  );
  return r.success ? r.data ?? [] : [];
}

export async function createProject(
  payload: CreateProjectPayload
): Promise<CreateProjectResponse> {
  const r = await clientFetch<CreateProjectResponse>("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.success) throw new Error(r.message ?? "Create project failed");
  return r.data;
}

export async function getProjects(params: {
  page?: string;
  limit?: string;

  name?: string;
  code?: string;
  plan_type?: string;

  is_active?: string | boolean;
  department_id?: string;
  start_date?: string;
}): Promise<ProjectListItem[]> {
  const qs = new URLSearchParams();
  qs.set("page", params.page ?? "1");
  qs.set("limit", params.limit ?? "20");

  if (params.name) qs.set("name", params.name.trim());
  if (params.code) qs.set("code", params.code.trim());
  if (params.plan_type) qs.set("plan_type", params.plan_type.trim());
  if (params.department_id)
    qs.set("department_id", params.department_id.trim());
  if (params.start_date) qs.set("start_date", params.start_date.trim());

  if (params.is_active !== undefined && params.is_active !== "") {
    const v =
      typeof params.is_active === "boolean"
        ? String(params.is_active)
        : String(params.is_active).trim();
    qs.set("is_active", v);
  }
  const r = await clientFetch<ProjectListItem[]>(
    `/api/projects?${qs.toString()}`,
    { cache: "no-store" }
  );

  if (!r.success) {
    console.error("getProjects error:", r.message);
    return [];
  }

  return r.data ?? [];
}

export async function updateProjectDetail(
  payload: GeneralInfoForUpdateData
): Promise<{ message: string }> {
  const normalized: GeneralInfoForUpdateData = {
    ...payload,
    regular_work_template_id: "60001234-1234-1234-1234-123456789003",
    start_date: normalizeDateOnly(payload.start_date),
    end_date: normalizeDateOnly(payload.end_date),
  };

  const r = await clientFetch<{ message: string }>("/api/projects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalized),
  });

  if (!r.success) throw new Error(r.message ?? "Update project failed");
  return r.data;
}
