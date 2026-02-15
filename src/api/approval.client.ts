import {
  ApprovalSubmitResponse,
  ProcessApprovalActionRequest,
  ProcessApprovalActionResponse,
  ApprovalQueueResponse,
} from "@/dto/approveDto";
import { clientFetch } from "@/lib/client-api";

export async function submitBudgetPlan(budgetPlanId: string) {
  return clientFetch<ApprovalSubmitResponse>(
    `/api/approve/submit/${encodeURIComponent(budgetPlanId)}`,
    { method: "POST" }
  );
}

export async function processApprovalAction(
  payload: ProcessApprovalActionRequest
) {
  return clientFetch<ProcessApprovalActionResponse>(
    "/api/approve/process-action",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}

export async function getApprovalQueue(budgetPlanId: string) {
  return clientFetch<ApprovalQueueResponse>(
    `/api/approve/queue/${encodeURIComponent(budgetPlanId)}`,
    { method: "GET" }
  );
}
