import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 }
      );
    }

    // Get the auth token from cookies to forward to external API
    const cookieStore = await cookies();
    const apiToken = cookieStore.get("api_token")?.value;
    
    if (!apiToken) {
      return NextResponse.json(
        { success: false, message: "No API token found" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, name, organization_id } = body;

    if (!code || !name || !organization_id) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: code, name, organization_id" },
        { status: 400 }
      );
    }

    // TODO: Validate that user has permission to create department for this organization
    // TODO: Check if department code already exists

    // Forward to external API
    const baseURL = process.env.API_BASE_URL;
    if (!baseURL) {
      return NextResponse.json(
        { success: false, message: "API_BASE_URL not configured" },
        { status: 500 }
      );
    }

    const externalRes = await fetch(`${baseURL}/admin/departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({ code, name, organization_id }),
    });

    if (!externalRes.ok) {
      const errorData = await externalRes.json().catch(() => ({ message: "External API error" }));
      return NextResponse.json(
        { success: false, message: errorData.message || `HTTP ${externalRes.status}` },
        { status: externalRes.status }
      );
    }

    const data = await externalRes.json();

    return NextResponse.json({
      success: true,
      data: data.data || data,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/departments] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}