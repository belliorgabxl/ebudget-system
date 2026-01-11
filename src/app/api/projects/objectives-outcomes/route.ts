import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_BASE_URL; 

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("api_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const project_id = body?.project_id;
    const objectives = body?.objectives;

    if (!project_id) {
      return NextResponse.json(
        { success: false, message: "project_id is required" },
        { status: 400 }
      );
    }


    if (!Array.isArray(objectives)) {
      return NextResponse.json(
        { success: false, message: "objectives must be an array" },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${API_BASE_URL}/projects/objectives-outcomes`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project_id, objectives }),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Upstream error" },
        { status: upstream.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
