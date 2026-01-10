import { nestFetch } from "@/lib/server-api";

export type UpdateDepartmentRequest = {
  code?: string;
  name?: string;
  is_active?: boolean;
};

export async function UpdateDepartmentFromApiServer(
  id: string,
  payload: UpdateDepartmentRequest
): Promise<boolean> {
  const r = await nestFetch(`/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  return r.success;
}
