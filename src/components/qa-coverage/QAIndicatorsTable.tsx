// File: components/qa-coverage/QAIndicatorsTable.tsx
"use client";

import React from "react";
import type { GetQaIndicatorsByYearRespond } from "@/dto/qaDto";
import { Eye, Trash2 } from "lucide-react";
import { convertCEtoBE } from "@/lib/util";

type Props = {
  qaIndicatorsData: GetQaIndicatorsByYearRespond[];
  onView: (id: string | null, indOrCount?: any) => void;
  onDelete?: (id: string | null, ind?: any) => void;
  currentPage?: number;
  onPrev?: () => void;
  onNext?: () => void;
  disableNext?: boolean;
};

function extractCountFromApi(item: any): number | null {
  if (!item || typeof item !== "object") return null;
  const keysToTry = ["project_count", "count_projects", "projects", "count", "total", "value"];
  for (const k of keysToTry) {
    if (k in item) {
      const v = item[k];
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
    }
  }
  if (item.stats && typeof item.stats === "object") {
    return extractCountFromApi(item.stats);
  }
  return null;
}

const twoLineClamp: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

export default function QAIndicatorsTable({
  qaIndicatorsData = [],
  onView,
  onDelete,
  currentPage = 1,
  onPrev,
  onNext,
  disableNext = false,
}: Props) {
  const isEmpty = !Array.isArray(qaIndicatorsData) || qaIndicatorsData.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <table className="min-w-full table-auto hidden md:table">
        <thead className="bg-slate-50">
          <tr className="text-xs text-slate-500">
            <th className="px-4 py-3 text-center">โค้ด</th>
            <th className="px-4 py-3 text-center">ตัวบ่งชี้</th>
            <th className="px-4 py-3 text-center">ปี</th>
            <th className="px-4 py-3 text-center">จำนวนโครงการที่เชื่อมโยง</th>
            <th className="px-4 py-3 text-center">การดำเนินการ</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {isEmpty ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                ไม่มีตัวบ่งชี้ในปีนี้
              </td>
            </tr>
          ) : (
            qaIndicatorsData.map((ind) => {
              const projects = extractCountFromApi(ind) ?? 0;
              const canDelete = projects === 0;

              return (
                <tr key={ind.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm text-slate-700 text-center align-middle">
                    <div className="mx-auto max-w-full overflow-hidden text-ellipsis whitespace-nowrap" title={ind.code}>
                      {ind.code}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700 text-center align-middle">
                    <div style={twoLineClamp} className="max-w-full" title={ind.name ?? ind.description}>
                      {ind.name ?? ind.description}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-500 text-center align-middle">
                    <div className="mx-auto overflow-hidden text-ellipsis whitespace-nowrap">{ind.year ? convertCEtoBE(ind.year) : "-"}</div>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700 text-center align-middle">
                    <div className="mx-auto overflow-hidden text-ellipsis whitespace-nowrap">{(projects ?? 0).toLocaleString()}</div>
                  </td>

                  <td className="px-4 py-4 text-sm text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          const idToSend = ind.id ?? null;
                          onView(idToSend ? String(idToSend) : null, ind);
                        }}
                        className="inline-flex items-center gap-2 px-2 hover:bg-slate-50"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onDelete && onDelete(ind.id ?? null, ind)}
                        disabled={!canDelete}
                        className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm ${
                          canDelete
                            ? "border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                            : "border-slate-100 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed"
                        }`}
                        title={canDelete ? "ลบตัวบ่งชี้" : "มีโครงการเชื่อมโยงอยู่ ไม่สามารถลบได้"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* mobile view */}
      {isEmpty ? (
        <div className="p-8 md:hidden">
          <div className="text-center text-sm text-slate-500">ไม่มีตัวบ่งชี้ในปีนี้</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3 md:hidden">
          {qaIndicatorsData.map((ind) => {
            const projects = extractCountFromApi(ind) ?? 0;
            const canDelete = projects === 0;
            return (
              <div key={ind.id} className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-slate-500">โค้ด</div>
                      <div className="text-xs text-slate-500">ปี</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap mr-4" title={ind.code}>
                        {ind.code}
                      </div>

                      <div className="text-sm text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap w-[56px] text-right">{ind.year ? convertCEtoBE(ind.year) : "-"}</div>
                    </div>

                    <div className="mt-2 text-xs text-slate-500">ตัวบ่งชี้</div>
                    <div className="mt-1 text-sm text-slate-700" style={{ height: 40, overflow: "hidden" }}>
                      <div style={twoLineClamp} title={ind.name ?? ind.description}>
                        {ind.name ?? ind.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between ml-3 w-[33%] min-w-[110px]">
                    <div className="text-sm text-slate-500 text-right">
                      <div className="text-xs">โครงการ</div>
                      <div className="text-sm text-slate-700 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">{(projects ?? 0).toLocaleString()}</div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          const idToSend = ind.id ?? null;
                          onView(idToSend ? String(idToSend) : null, ind);
                        }}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="h-4 w-4" /> ดู
                      </button>

                      <button
                        onClick={() => onDelete && onDelete(ind.id ?? null, ind)}
                        disabled={!canDelete}
                        className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm shadow-sm ${
                          canDelete
                            ? "border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                            : "border-slate-100 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed"
                        }`}
                        title={canDelete ? "ลบตัวบ่งชี้" : "มีโครงการเชื่อมโยงอยู่ ไม่สามารถลบได้"}
                      >
                        <Trash2 className="h-4 w-4" /> ลบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* simple pagination footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
        <div className="text-xs text-slate-500">หน้า {currentPage}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={currentPage <= 1}
            className={`px-3 py-1 rounded-md text-sm ${currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"}`}
          >
            ก่อนหน้า
          </button>

          <button
            onClick={onNext}
            disabled={disableNext}
            className={`px-3 py-1 rounded-md text-sm ${disableNext ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"}`}
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
