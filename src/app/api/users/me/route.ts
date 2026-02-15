import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/users/me
 * Get current authenticated user profile
 */
export async function GET() {
  try {
    const baseURL = process.env.API_BASE_URL;
    if (!baseURL) {
      return NextResponse.json(
        { success: false, message: "API configuration error" },
        { status: 500 }
      );
    }

    const jar = await cookies();
    const token = jar.get("api_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const res = await fetch(`${baseURL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { success: false, message: errorText || "Failed to get user profile" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/me
 * Update current authenticated user profile
 */
export async function PUT(req: Request) {
  try {
    const payload = await req.json();

    const baseURL = process.env.API_BASE_URL;
    if (!baseURL) {
      return NextResponse.json(
        { success: false, message: "API configuration error" },
        { status: 500 }
      );
    }

    const jar = await cookies();
    const token = jar.get("api_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const res = await fetch(`${baseURL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { success: false, message: errorText || "Failed to update profile" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
