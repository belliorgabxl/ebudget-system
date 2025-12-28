import { nestGet } from "@/lib/server-api";

type CheckPermissionResponse = {
  has_permission: boolean;
};

export async function checkApprovalPermissionServer(budgetPlanId: string) {
  const r = await nestGet<CheckPermissionResponse>(
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
  const canApprove = Boolean(r.data?.has_permission);

  return canApprove;
}
