import { NextResponse } from "next/server";
import { nestGet, nestPost } from "@/lib/server-api";
import type { RoleRespond } from "@/dto/roleDto";

/**
 * GET /api/roles
 * Get roles for the current user's organization (from JWT token)
 */
export async function GET(req: Request) {
  try {
    // Call backend without organization_id parameter
    // Backend will use organization from JWT token
    const r = await nestGet<{ data?: RoleRespond | RoleRespond[] }>("/roles");

    if (!r.success) {
      return NextResponse.json(
        { success: false, message: r.message },
        { status: 400 }
      );
    }

    const payload = r.data?.data;
    const list = Array.isArray(payload)
      ? payload
      : payload
      ? [payload]
      : [];

    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    console.error("[GET /api/roles] Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/roles
 * Create new role
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("[POST /api/roles] Received body:", body);

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Role name is required",
        },
        { status: 400 }
      );
    }

    if (!body.role_code || typeof body.role_code !== "string" || body.role_code.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Role code is required",
        },
        { status: 400 }
      );
    }

    if (!body.organization_id || typeof body.organization_id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Organization ID is required",
        },
        { status: 400 }
      );
    }

    if (body.approval_level !== undefined && body.approval_level < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Approval level must be greater than or equal to 0",
        },
        { status: 400 }
      );
    }

    const result = await nestPost("/roles", body);

    console.log("[POST /api/roles] Result:", result);

    if (!result.success) {
      // Parse error message if it's JSON string
      let errorMessage = "Failed to create role";
      if (result.message) {
        try {
          const parsed = JSON.parse(result.message);
          errorMessage = parsed.error || parsed.message || result.message;
        } catch {
          errorMessage = result.message;
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: "Role created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/roles] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
        error: true,
        code: 500,
      },
      { status: 500 }
    );
  }
}
