import { NextResponse } from "next/server";
import { CreateUserFromApiServer, GetAllUsersFromApiServer } from "@/api/users.server";
import type { CreateUserRequest } from "@/dto/userDto";

/**
 * GET /api/users
 * ดึงรายชื่อผู้ใช้ทั้งหมดในองค์กร
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const organization_name = searchParams.get("organization_name") || undefined;
    const is_active = searchParams.get("is_active");
    const role = searchParams.get("role") || undefined;
    const is_system_role = searchParams.get("is_system_role");
    const full_name = searchParams.get("full_name") || undefined;

    // Build query string for backend
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    
    if (organization_name) params.set("organization_name", organization_name);
    if (is_active !== null) params.set("is_active", is_active);
    if (role) params.set("role", role);
    if (is_system_role !== null) params.set("is_system_role", is_system_role);
    if (full_name) params.set("full_name", full_name);

    // Call backend API with query string
    const url = `/users?${params.toString()}`;
    const users = await GetAllUsersFromApiServer(url);

    // Return response in backend format
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/users] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * สร้างผู้ใช้ใหม่
 */
export async function POST(req: Request) {
  try {
    const payload: CreateUserRequest = await req.json();

    // Basic validation
    if (!payload.email || !payload.username || !payload.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: email, username, password",
        },
        { status: 400 }
      );
    }

    const result = await CreateUserFromApiServer(payload);

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
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/users] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
