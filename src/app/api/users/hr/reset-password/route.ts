import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/users/hr/reset-password
 * HR resets user password
 */
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Validation
    if (!payload.user_id || !payload.new_password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: user_id, new_password" },
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

    const res = await fetch(`${baseURL}/users/hr/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { success: false, message: errorText || "Failed to reset password" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, message: data.message || "Password reset successfully" });
  } catch (error: any) {
    console.error("HR reset password error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
