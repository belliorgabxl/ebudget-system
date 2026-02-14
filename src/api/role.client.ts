import type { RoleRespond } from "@/dto/roleDto";
import { clientFetch } from "@/lib/client-api";

export async function GetRoleFromApi(organization_id?: string): Promise<RoleRespond[]> {
  const url = organization_id 
    ? `/api/roles?organization_id=${encodeURIComponent(organization_id)}`
    : "/api/roles";

  const r = await clientFetch<{ data?: RoleRespond[] } | RoleRespond[]>(
    url,
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
