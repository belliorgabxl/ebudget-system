import { NextResponse } from "next/server";
import {
  GetOrganizationByIdFromApiServer,
  UpdateOrganizationFromApiServer,
  DeleteOrganizationFromApiServer,
} from "@/api/organization.server";

/**
 * GET /api/organizations/[id]
 * Get single organization by ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization ID is required",
        },
        { status: 400 }
      );
    }

    const organization = await GetOrganizationByIdFromApiServer(id);

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error: any) {
    console.error("[GET /api/organizations/[id]] Error:", error);
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
 * PUT /api/organizations/[id]
 * Update organization (🚧 Backend not implemented yet)
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization ID is required",
        },
        { status: 400 }
      );
    }

    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Organization name is required",
        },
        { status: 400 }
      );
    }

    const result = await UpdateOrganizationFromApiServer({
      id,
      name: body.name,
      type: body.type,
      max_approval_level: body.max_approval_level,
      roles: body.roles,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to update organization",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Organization updated successfully",
    });
  } catch (error: any) {
    console.error("[PUT /api/organizations/[id]] Error:", error);
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
 * DELETE /api/organizations/[id]
 * Delete organization (🚧 Backend not implemented yet)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization ID is required",
        },
        { status: 400 }
      );
    }

    const success = await DeleteOrganizationFromApiServer(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete organization",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Organization deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[DELETE /api/organizations/[id]] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
