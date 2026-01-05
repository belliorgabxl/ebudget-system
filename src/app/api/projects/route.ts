import { NextResponse } from "next/server";
import { nestFetch } from "../_core/nest";
import { ok, fail } from "../_core/response";
import type {
  CreateProjectPayload,
  CreateProjectResponse,
} from "@/dto/createProjectDto";

// สมมติ Nest ตอบแบบเดิมของคุณ: { success: boolean; message?: string; data?: T }
type NestEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function POST(req: Request) {
  let payload: CreateProjectPayload;

  try {
    payload = (await req.json()) as CreateProjectPayload;
  } catch {
    return NextResponse.json(fail("Invalid JSON body", "4000"));
  }

  try {
    const r = await nestFetch<NestEnvelope<CreateProjectResponse>>(
      "/projects/",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!r.ok || !r.data) {
      return NextResponse.json(fail(r.text ?? "Create project failed"));
    }

    if (!r.data.success) {
      return NextResponse.json(fail(r.data.message ?? "Create project failed"));
    }
    return NextResponse.json(ok(r.data.data ? [r.data.data] : []));
  } catch (e: any) {
    return NextResponse.json(fail(e?.message ?? "INTERNAL_ERROR"));
  }
}
