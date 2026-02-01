import type {
  AnnualBudget,
  CreateAnnualBudgetRequest,
  UpdateAnnualBudgetRequest,
  GetAnnualBudgetSummaryResponse,
} from "@/dto/annualBudgetDto";
import { clientFetch, clientFetchArray } from "@/lib/client-api";

/* -------------------- query -------------------- */

/**
 * GET /api/annual-budgets
 */
export async function GetAnnualBudgetsFromApi(): Promise<AnnualBudget[]> {
  try {
    const r = await clientFetch<{ success: boolean; data: AnnualBudget[] }>(
      "/api/annual-budgets",
      {
        cache: "no-store",
      }
    );

    if (!r.success) {
      console.warn("[GetAnnualBudgetsFromApi] API call failed:", r);
      return [];
    }

    const data = r.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[GetAnnualBudgetsFromApi] Error:", error);
    return [];
  }
}

/**
 * GET /api/annual-budgets/{id}
 */
export async function GetAnnualBudgetByIdFromApi(
  id: number
): Promise<AnnualBudget | null> {
  try {
    const r = await clientFetch<any>(`/api/annual-budgets/${id}`, {
      cache: "no-store",
    });

    if (!r.success) {
      console.warn("[GetAnnualBudgetByIdFromApi] API call failed:", r);
      return null;
    }

    const body = r.data;
    if (!body) return null;

    // Support multiple response formats
    if (body.data && typeof body.data === "object") {
      return body.data as AnnualBudget;
    }

    if (typeof body === "object") {
      return body as AnnualBudget;
    }

    return null;
  } catch (error) {
    console.error("[GetAnnualBudgetByIdFromApi] Error:", error);
    return null;
  }
}

/**
 * GET /api/annual-budgets/summary
 */
export async function GetAnnualBudgetSummaryFromApi(): Promise<GetAnnualBudgetSummaryResponse | null> {
  try {
    const r = await clientFetch<any>("/api/annual-budgets/summary", {
      cache: "no-store",
    });

    if (!r.success) {
      console.warn("[GetAnnualBudgetSummaryFromApi] API call failed:", r);
      return null;
    }

    const body = r.data;
    if (!body) return null;

    if (typeof body === "object") {
      return body as GetAnnualBudgetSummaryResponse;
    }

    return null;
  } catch (error) {
    console.error("[GetAnnualBudgetSummaryFromApi] Error:", error);
    return null;
  }
}

/* -------------------- mutations -------------------- */

/**
 * POST /api/annual-budgets
 */
export async function CreateAnnualBudgetFromApi(
  payload: CreateAnnualBudgetRequest
): Promise<{ ok: boolean; status: number; data?: any; message?: string }> {
  try {
    const res = await fetch("/api/annual-budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: body,
        message: body?.message ?? `HTTP ${res.status}`,
      };
    }

    // successful create
    return { ok: true, status: res.status, data: body?.data ?? body };
  } catch (err: any) {
    return { ok: false, status: 0, message: err?.message ?? "Network error" };
  }
}

/**
 * PUT /api/annual-budgets
 */
export async function UpdateAnnualBudgetFromApi(
  payload: UpdateAnnualBudgetRequest
): Promise<boolean> {
  try {
    const r = await clientFetch("/api/annual-budgets", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return r.success;
  } catch (error) {
    console.error("[UpdateAnnualBudgetFromApi] Error:", error);
    return false;
  }
}

/**
 * DELETE /api/annual-budgets/{id}
 */
export async function DeleteAnnualBudgetFromApi(id: number): Promise<boolean> {
  try {
    const r = await clientFetch(`/api/annual-budgets/${id}`, {
      method: "DELETE",
    });

    return r.success;
  } catch (error) {
    console.error("[DeleteAnnualBudgetFromApi] Error:", error);
    return false;
  }
}
