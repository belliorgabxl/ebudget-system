import { nestGet } from "@/lib/server-api";

export type CheckPermissionResponse = {
  currentRole: number;
  current_level: number;
  has_permission: boolean;
};

type RawCheckPermissionResponse = Partial<{
  currentRole: number;
  current_role: number;
  current_level: number;
  currentLevel: number;
  has_permission: boolean;
  hasPermission: boolean;
}>;

export async function checkApprovalPermissionServer(
  budgetPlanId: string
): Promise<CheckPermissionResponse> {
  const r = await nestGet<RawCheckPermissionResponse>(
    `/approval-workflow/check-permission?budget_plan_id=${encodeURIComponent(
      budgetPlanId
    )}`
  );

  if (!r.success) {
    console.error("[checkApprovalPermissionServer] failed", {
      budgetPlanId,
      message: r.message,
    });
    throw new Error(r.message ?? "Failed to check permission");
  }

  const data = r.data ?? {};

  const currentRole =
    typeof data.currentRole === "number"
      ? data.currentRole
      : typeof data.current_role === "number"
      ? data.current_role
      : 0;

  const current_level =
    typeof data.current_level === "number"
      ? data.current_level
      : typeof data.currentLevel === "number"
      ? data.currentLevel
      : 0;

  const has_permission =
    typeof data.has_permission === "boolean"
      ? data.has_permission
      : typeof data.hasPermission === "boolean"
      ? data.hasPermission
      : false;

  return { currentRole, current_level, has_permission };
}
