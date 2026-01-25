import { NextResponse } from "next/server";
import {
  GetOrganizationsFromApiServer,
  CreateOrganizationFromApiServer,
} from "@/api/organization.server";
import type { GetOrganizationsParams } from "@/dto/organizationDto";

/**
 * GET /api/organizations?page=1&limit=10&name=&type=&is_active=true
 * Get list of organizations with pagination and filters
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const params: GetOrganizationsParams = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      name: searchParams.get("name") || undefined,
      type: searchParams.get("type") || undefined,
    };

    // Parse is_active boolean
    const isActiveParam = searchParams.get("is_active");
    if (isActiveParam !== null) {
      params.is_active = isActiveParam === "true";
    }

    // Validate pagination
    if (params.page! < 1 || params.limit! < 1 || params.limit! > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pagination parameters",
        },
        { status: 400 }
      );
    }

    const result = await GetOrganizationsFromApiServer(params);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      total_pages: result.total_pages,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: result.total_pages,
        has_prev: result.page > 1,
        has_next: result.page < result.total_pages,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/organizations] Error:", error);
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
 * POST /api/organizations
 * Create new organization
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("[POST /api/organizations] Received body:", body);

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Organization name is required",
        },
        { status: 400 }
      );
    }

    const result = await CreateOrganizationFromApiServer({
      name: body.name,
      type: body.type,
    });

    console.log("[POST /api/organizations] Result:", result);

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to create organization",
          error: true,
          code: 500,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: "Organization created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/organizations] Error:", error);
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
