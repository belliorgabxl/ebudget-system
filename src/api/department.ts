import type { Department } from "@/dto/departmentDto";
import { clientFetch } from "@/lib/client-api";

export async function fetchDepartments(): Promise<Department[]> {
  const r = await clientFetch<{ data?: Department[] } | Department[]>("/api/department", { cache: "no-store" });
  if (!r.success) return [];
  const body = r.data as any;
  return Array.isArray(body) ? body : (body?.data ?? []);
}

export async function GetDepartmentsDetailByIdFromApi(
  id: string
): Promise<Department | null> {
  try {
    console.log("[Client] Fetching department detail:", id);
    
    const r = await clientFetch<Department>(
      `/api/department/detail/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );

    console.log("[Client] API response:", {
      success: r.success,
      hasData: r.success ? !!r.data : false,
      dataType: r.success ? typeof r.data : "N/A",
      data: r.success ? r.data : null,
    });

    if (!r.success) {
      console.error("[Client] API call failed:", r);
      return null;
    }

    if (!r.data) {
      console.warn("[Client] API returned success but no data");
      return null;
    }

    // r.data is already the Department object
    console.log("[Client] Returning department:", r.data);
    return r.data;
  } catch (error: any) {
    console.error("[Client] Exception in GetDepartmentsDetailByIdFromApi:", error);
    return null;
  }
}

export async function GetUsersByDepartmentIdFromApi(departmentId: string) {
  try {
    console.log("[Client] Fetching users for department:", departmentId);
    
    const r = await clientFetch<any>(
      `/api/users/department/${encodeURIComponent(departmentId)}`,
      { cache: "no-store" }
    );

    console.log("[Client] Users API response:", r);

    if (!r.success) {
      console.error("[Client] Failed to fetch users:", r);
      return { users: [], total: 0 };
    }

    // Handle different response formats
    let rawUsers: any[] = [];
    let total = 0;

    if (Array.isArray(r.data)) {
      // Direct array
      rawUsers = r.data;
      total = r.data.length;
    } else if (r.data && typeof r.data === 'object') {
      // Wrapped in object
      rawUsers = r.data.data || r.data.users || [];
      total = r.data.total || rawUsers.length;
    }

    console.log("[Client] Parsed users:", { count: rawUsers.length, total });

    const users = rawUsers.map((u: any) => ({
      id: u.id,
      name: u.full_name || `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "-",
      title: u.position ?? u.role ?? "-",
      email: u.email || "-",
      department_name: u.department_name ?? "-",
      status: u.is_active ? "Active" : "Inactive",
      isActive: Boolean(u.is_active),
      lastLogin: u.last_login_at ?? undefined,
    }));

    console.log("[Client] Returning users:", users);

    return { users, total };
  } catch (error: any) {
    console.error("[Client] Exception in GetUsersByDepartmentIdFromApi:", error);
    return { users: [], total: 0 };
  }
}