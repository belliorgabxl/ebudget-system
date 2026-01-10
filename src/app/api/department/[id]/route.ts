import { NextRequest, NextResponse } from "next/server";
import { UpdateDepartmentFromApiServer } from "@/api/department.server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await req.json();

    const ok = await UpdateDepartmentFromApiServer(id, payload);

    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Update failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API] PATCH /api/department/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
