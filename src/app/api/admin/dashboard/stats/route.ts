import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
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

    // Forward to external API
    const baseURL = process.env.API_BASE_URL;
    const response = await fetch(`${baseURL}/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to fetch dashboard stats" }));
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to fetch dashboard stats" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
