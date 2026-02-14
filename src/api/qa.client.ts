import type {
  GetQaIndicatorsByYearAllRespond,
  GetQaIndicatorsCountsByYear,
  GetQaIndicatorsDetailsRespond,
  GetQaIndicatorsRespond,
  GetQaIndicatorsByYearRespond,
  QaRequest,
} from "@/dto/qaDto";
import { clientFetch } from "@/lib/client-api";

/**
 * Get all QA indicators for a specific year
 */
export async function GetQaIndicatorsByYearAllFromApi(year: number): Promise<GetQaIndicatorsByYearAllRespond[]> {
  const r = await clientFetch<{ data?: GetQaIndicatorsByYearAllRespond[] } | GetQaIndicatorsByYearAllRespond[]>(
    `/api/qa/indicators/year/${year}/all`,
    { cache: "no-store" }
  );

  if (!r.success) {
    console.error("GetQaIndicatorsByYearAllFromApi error", r.message);
    return [];
  }

  const body = r.data as any;
  return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
}

/**
 * Get paginated QA indicators for a specific year
 */
export async function GetQaIndicatorsByYearFromApi(
  year: number,
  page: number
): Promise<GetQaIndicatorsByYearRespond[]> {
  const url = `/api/qa/indicators/year/${year}?page=${page || 1}&limit=10`;

  const r = await clientFetch<{ data?: GetQaIndicatorsByYearRespond[] } | GetQaIndicatorsByYearRespond[]>(
    url,
    { cache: "no-store" }
  );

  if (!r.success) {
    console.error("GetQaIndicatorsByYearFromApi error", r.message);
    return [];
  }

  const body = r.data as any;
  return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
}

/**
 * Get QA indicators details
 */
export async function GetQaIndicatorsDetailsFromApi(): Promise<GetQaIndicatorsDetailsRespond[]> {
  const r = await clientFetch<{ data?: GetQaIndicatorsDetailsRespond[] } | GetQaIndicatorsDetailsRespond[]>(
    "/api/qa/indicators/details",
    { cache: "no-store" }
  );

  if (!r.success) {
    console.error("GetQaIndicatorsDetailsFromApi error", r.message);
    return [];
  }

  const body = r.data as any;
  return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
}

/**
 * Get QA indicators counts by year
 */
export async function GetQaIndicatorsCountsByYearFromApi(): Promise<GetQaIndicatorsCountsByYear[]> {
  const r = await clientFetch<{ data?: GetQaIndicatorsCountsByYear[] } | GetQaIndicatorsCountsByYear[]>(
    "/api/qa/indicators/counts-by-year",
    { cache: "no-store" }
  );

  if (!r.success) {
    console.error("GetQaIndicatorsCountsByYearFromApi error", r.message);
    return [];
  }

  const body = r.data as any;
  return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
}

/**
 * Get QA indicator detail by ID
 */
export async function GetQaIndicatorsDetailByIdApi(id: string): Promise<GetQaIndicatorsRespond[]> {
  const r = await clientFetch<{ data?: GetQaIndicatorsRespond[] } | GetQaIndicatorsRespond[]>(
    `/api/qa/indicators/${id}`,
    { cache: "no-store" }
  );

  if (!r.success) {
    console.error("GetQaIndicatorsDetailByIdApi error", r.message);
    return [];
  }

  const body = r.data as any;
  
  if (Array.isArray(body)) {
    return body;
  }
  
  if (Array.isArray(body?.data)) {
    return body.data;
  }
  
  // Single object case
  if (body && typeof body === "object" && "id" in body) {
    return [body];
  }
  
  return [];
}

/**
 * Update QA indicator
 */
export async function UpdateQaDetailFromApi(id: string, payload: Partial<QaRequest>): Promise<boolean> {
  const r = await clientFetch<any>(`/api/qa/indicators/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.success) {
    console.error("UpdateQaDetailFromApi error", r.message);
    return false;
  }

  return true;
}

/**
 * Create QA indicator
 */
export async function CreateQaFromApi(payload: QaRequest): Promise<boolean> {
  const r = await clientFetch<any>("/api/qa/indicators", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.success) {
    console.error("CreateQaFromApi error", r.message);
    return false;
  }

  return true;
}

/**
 * Delete QA indicator
 */
export async function DeleteQaFromApi(id: string): Promise<boolean> {
  const r = await clientFetch<any>(`/api/qa/indicators/${id}`, {
    method: "DELETE",
  });

  if (!r.success) {
    console.error("DeleteQaFromApi error", r.message);
    return false;
  }

  return true;
}

/**
 * Search QA indicators by name or code
 */
export async function SearchQaIndicatorsByNameCode(nameCode: string): Promise<GetQaIndicatorsByYearRespond[]> {
  const url = `/api/qa/indicators/search?NameCode=${encodeURIComponent(nameCode)}`;

  const r = await clientFetch<{ data?: GetQaIndicatorsByYearRespond[] } | GetQaIndicatorsByYearRespond[]>(
    url,
    { cache: "no-store" }
  );

  if (!r.success) {
    console.error("SearchQaIndicatorsByNameCode error", r.message);
    return [];
  }

  const body = r.data as any;
  
  if (Array.isArray(body)) {
    return body;
  }
  
  if (Array.isArray(body?.data)) {
    return body.data;
  }
  
  if (Array.isArray(body?.data?.items)) {
    return body.data.items;
  }
  
  return [];
}
