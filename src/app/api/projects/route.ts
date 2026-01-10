import { NextResponse } from "next/server";
import { nestFetch, nestPost } from "@/lib/server-api";
import type {
  CreateProjectPayload,
  CreateProjectResponse,
} from "@/dto/createProjectDto";
import { GeneralInfoForUpdateData } from "@/dto/projectDto";

export async function POST(req: Request) {
  let payload: CreateProjectPayload | null = null;

  try {
    payload = (await req.json()) as CreateProjectPayload;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const r = await nestPost<CreateProjectResponse>("/projects/", payload);

  if (!r.success) {
    return NextResponse.json(
      { success: false, message: r.message ?? "Create project failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: r.data });
}


export async function PATCH(req: Request) {
  let payload: { project_detail: GeneralInfoForUpdateData } | null = null;

  try {
    payload = (await req.json()) as { project_detail: GeneralInfoForUpdateData };
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!payload?.project_detail?.project_id) {
    return NextResponse.json(
      { success: false, message: "project_id is required" },
      { status: 400 }
    );
  }


  const r = await nestFetch<{ message: string }>("/projects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.success) {
    return NextResponse.json(
      { success: false, message: r.message ?? "Update project failed" },
      { status: r.status ?? 400 }
    );
  }

  return NextResponse.json({ success: true, data: r.data });
}