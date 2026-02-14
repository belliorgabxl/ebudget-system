import type { RoleRespond } from "@/dto/roleDto";
import { clientFetch } from "@/lib/client-api";

/**
 * Get roles for the current user's organization (from JWT token)
 */
export async function GetRoleFromApi(): Promise<RoleRespond[]> {
  const r = await clientFetch<{ data?: RoleRespond[] } | RoleRespond[]>(
    "/api/roles",
    { cache: "no-store" }
  );

  if (!r.success) {
    console.error("GetRoleFromApi error", r.message);
    return [];
  }

  const body = r.data as any;

  return Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
    ? body.data
    : [];
}

/**
 * Get roles by organization ID (for admin use)
 */
export async function GetRolesByOrgIdFromApi(organization_id: string): Promise<RoleRespond[]> {
  const url = `/api/roles/by-org?organization_id=${encodeURIComponent(organization_id)}`;

  const r = await clientFetch<{ data?: RoleRespond[] } | RoleRespond[]>(
    url,
    { cache: "no-store" }
  );

  if (!r.success) {
    console.error("GetRolesByOrgIdFromApi error", r.message);
    return [];
  }

  const body = r.data as any;

  return Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
    ? body.data
    : [];
}

export async function CreateRoleFromApi(data: any): Promise<any> {
  return clientFetch('/api/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

export async function UpdateRoleFromApi(id: string, data: any): Promise<any> {
  return clientFetch(`/api/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}
