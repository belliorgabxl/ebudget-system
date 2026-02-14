import { NextResponse } from "next/server";
import { CreateUserByAdminFromApiServer } from "@/api/users.server";
import type { CreateUserRequest } from "@/dto/userDto";

/**
 * POST /api/admin/users/create
 * Admin สร้างผู้ใช้ใหม่
 */
export async function POST(req: Request) {
  try {
    const payload: CreateUserRequest = await req.json();

    // Basic validation
    if (!payload.email || !payload.username || !payload.password || !payload.organization_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: email, username, password, organization_id",
        },
        { status: 400 }
      );
    }

    if (!payload.role_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required field: role_id",
        },
        { status: 400 }
      );
    }

    const result = await CreateUserByAdminFromApiServer(payload);

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to create user",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: "User created successfully by admin",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/admin/users/create] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
