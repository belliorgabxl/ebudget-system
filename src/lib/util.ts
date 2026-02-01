import { DateError, ValidationIssue } from "@/dto/projectDto";

export function parseTTL(ttl: string): number {
  const match = ttl.match(/^(\d+)(s|m|h|d)$/);
  if (!match) throw new Error("Invalid TTL format");

  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      throw new Error("Invalid TTL unit");
  }
}


export function yearFilterItems(): { label: string; value: string }[] {
  const currentYear = new Date().getFullYear()
  const buddhistYear = currentYear + 543

  const years: { label: string; value: string }[] = []

  years.push({ label: "ทั้งหมด", value: "all" })

  for (let i = 0; i < 6; i++) {
    const year = String(buddhistYear - i)
    years.push({ label: year, value: year })
  }

  return years
}


export const generateSixDigitCode = () => {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
};

export function parseDateOrNull(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function validateStartEndDate(
  start: string,
  end: string
): DateError | null {
  if (!start) return "MISSING_START";
  if (!end) return "MISSING_END";

  const s = parseDateOrNull(start);
  if (!s) return "INVALID_START";
  const e = parseDateOrNull(end);
  if (!e) return "INVALID_END";

  const sTime = s.getTime();
  const eTime = e.getTime();

  if (sTime === eTime) return "START_EQUALS_END";
  if (sTime > eTime) return "START_AFTER_END";
  return null;
}

export function pushIfEmpty(
  issues: ValidationIssue[],
  field: string,
  value: string | undefined | null,
  message: string
) {
  if (!value || value.trim() === "") issues.push({ field, message });
}

export function toThaiDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
export function convertBEtoCE(yearBE: number): number {
  return yearBE - 543;
}
export function convertCEtoBE(yearCE: number): number {
  return yearCE + 543;
}

export function mapStatusToIsActive(status?: string): string | undefined {
  if (!status) return undefined;
  switch (status) {
    case "APPROVED":
    case "PENDING_APPROVE":
      return "true";
    default:
      return undefined;
  }
}

export function buildPageHref(sp: any, nextPage: number) {
  const qs = new URLSearchParams();
  if (sp.q) qs.set("q", String(sp.q));
  if (sp.code) qs.set("code", String(sp.code));
  if (sp.plan_type) qs.set("plan_type", String(sp.plan_type));
  if (sp.is_active) qs.set("is_active", String(sp.is_active));
  if (sp.department_id) qs.set("department_id", String(sp.department_id));
  if (sp.start_date) qs.set("start_date", String(sp.start_date));

  qs.set("page", String(nextPage));
  return `?${qs.toString()}`;
}
/**
 * Format number to compact notation with Thai suffixes
 * @param value - Number to format
 * @returns Formatted string (e.g., "1.2M", "500K", "45.3B")
 */
export function formatCompactNumber(value: number): string {
  if (value === 0) return "0";
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  // Billion (พันล้าน)
  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(1)}B`;
  }
  
  // Million (ล้าน)
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1)}M`;
  }
  
  // Thousand (พัน)
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(1)}K`;
  }
  
  // Less than 1000
  return `${sign}${absValue.toFixed(0)}`;
}


export async function loadImageAsBase64(src: string): Promise<string> {
  const res = await fetch(src);
  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
