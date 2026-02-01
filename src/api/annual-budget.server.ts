import {
  AnnualBudget,
  CreateAnnualBudgetRequest,
  GetAnnualBudgetsResponse,
  GetAnnualBudgetByIdResponse,
  GetAnnualBudgetSummaryResponse,
  UpdateAnnualBudgetRequest,
  DeleteAnnualBudgetResponse,
} from "@/dto/annualBudgetDto";
import { nestFetch, nestGet } from "@/lib/server-api";

/**
 * Fetch all annual budgets
 */
export async function fetchAnnualBudgets(): Promise<AnnualBudget[]> {
  const r = await nestGet<GetAnnualBudgetsResponse>("/annual-budgets");

  if (!r.success) {
    throw new Error(r.message ?? "Failed to fetch annual budgets");
  }
  return r.data ?? [];
}

/**
 * Fetch annual budget by ID
 */
export async function fetchAnnualBudgetById(id: number): Promise<AnnualBudget> {
  const r = await nestGet<GetAnnualBudgetByIdResponse>(
    `/annual-budgets/${id}`
  );

  if (!r.success) {
    throw new Error(r.message ?? "Failed to fetch annual budget");
  }
  return r.data;
}

/**
 * Fetch annual budget summary
 */
export async function fetchAnnualBudgetSummary(): Promise<GetAnnualBudgetSummaryResponse> {
  const r = await nestGet<GetAnnualBudgetSummaryResponse>(
    "/annual-budgets/summary"
  );

  if (!r.success) {
    throw new Error(r.message ?? "Failed to fetch annual budget summary");
  }
  return r.data;
}

/**
 * Create new annual budget
 */
export async function createAnnualBudget(
  payload: CreateAnnualBudgetRequest
): Promise<AnnualBudget> {
  const r = await nestFetch<AnnualBudget>("/annual-budgets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.success) {
    throw new Error(r.message ?? "Failed to create annual budget");
  }
  return r.data;
}

/**
 * Update annual budget
 */
export async function updateAnnualBudget(
  payload: UpdateAnnualBudgetRequest
): Promise<AnnualBudget> {
  const r = await nestFetch<AnnualBudget>("/annual-budgets", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.success) {
    throw new Error(r.message ?? "Failed to update annual budget");
  }
  return r.data;
}

/**
 * Delete annual budget
 */
export async function deleteAnnualBudget(id: number): Promise<boolean> {
  const r = await nestFetch<DeleteAnnualBudgetResponse>(
    `/annual-budgets/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!r.success) {
    throw new Error(r.message ?? "Failed to delete annual budget");
  }
  return true;
}
