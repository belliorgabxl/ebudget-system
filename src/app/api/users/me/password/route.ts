import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * PUT /api/users/me/password
 * Change current user's password
 */
export async function PUT(req: Request) {
  try {
    const payload = await req.json();

    // Validation
    if (!payload.current_password || !payload.new_password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: current_password, new_password" },
        { status: 400 }
      );
    }

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

    const res = await fetch(`${baseURL}/users/me/password`, {
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
        { success: false, message: errorText || "Failed to change password" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, message: data.message || "Password changed successfully" });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
