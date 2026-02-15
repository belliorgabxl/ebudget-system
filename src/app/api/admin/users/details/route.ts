import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * PATCH /api/admin/users/details
 * Admin updates user details (supports optional department_id)
 */
export async function PATCH(req: Request) {
  try {
    const payload = await req.json();

    // Basic validation
    if (!payload.user_id) {
      return NextResponse.json(
        { success: false, message: "Missing required field: user_id" },
        { status: 400 }
      );
    }

    // Forward to backend API
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

    const res = await fetch(`${baseURL}/admin/users/details`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { success: false, message: errorText || "Failed to update user" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Admin update user details error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
