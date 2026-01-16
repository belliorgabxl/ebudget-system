import { NextResponse } from "next/server";
import { fetchProjectInformationServer } from "@/api/project.server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("project_id");

    if (!projectId) {
      return NextResponse.json(
        { message: "project_id is required" },
        { status: 400 }
      );
    }

    const data = await fetchProjectInformationServer(projectId);

    if (!data) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("[api/projects/information] error:", err);
    return NextResponse.json(
      { message: err?.message ?? "Failed to fetch project information" },
      { status: 500 }
    );
  }
}
