"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AddQAModal from "./qa-add-modal";
import QADetailModal from "./qa-detail-modal";
import QAHeader from "@/components/qa-coverage/QAHeader";
import QAIndicatorsTable from "@/components/qa-coverage/QAIndicatorsTable";
import { Search as SearchIcon, XIcon } from "lucide-react";
import {
  DeleteQaFromApi,
  GetQaIndicatorsByYearFromApi,
  GetQaIndicatorsCountsByYearFromApi,
  SearchQaIndicatorsByNameCode,
} from "@/api/qa/route";
import type { GetQaIndicatorsByYearRespond } from "@/dto/qaDto";
import { ToastProvider, useToast } from "@/components/ToastProvider";

type NewQA = {
  code: string;
  name: string;
  year?: number;
  projects?: number;
  gaps?: boolean;
};

type SelectedQA = {
  code: string;
  name: string;
  projects: number;
  gaps: boolean;
};

function beToCe(yearBe: string | number): number | null {
  const y = Number(yearBe);
  if (Number.isNaN(y)) return null;
  return y - 543;
}

function ceToBe(yearCe?: number | null): string | undefined {
  if (yearCe === undefined || yearCe === null) return undefined;
  return String(Number(yearCe) + 543);
}

export default function  QACoveragePage() {
  const years = [2566, 2567, 2568, 2569];
  const [year, setYear] = useState<number>(2568);

  // input shown in UI
  const [query, setQuery] = useState<string>("");

  // the actual query sent to server (search mode) - set when pressing Enter or clicking search
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQaId, setSelectedQaId] = useState<string | null>(null);
  const [qaIndicators, setQaIndicators] = useState<GetQaIndicatorsByYearRespond[]>([]);
  const [count_data, set_count_data] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // pagination simple
  const [page, setPage] = useState<number>(1);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const toast = useToast();

  // 1) fetchList (แก้ไขกรณี search ให้ set ผลลัพธ์จริง ๆ)
  const fetchList = useCallback(
    async (usePage: number = page, useSearch?: string) => {
      setLoading(true);
      try {
        const year_ce = beToCe(year);
        if (year_ce === null) {
          setQaIndicators([]);
          setIsLastPage(true);
          setLoading(false);
          return;
        }

        // If searchQuery provided -> use search endpoint
        if (useSearch && useSearch.trim() !== "") {
          // server-side search by code/name
          const results = await SearchQaIndicatorsByNameCode(useSearch.trim());

          // *** สำคัญ: เอาผลลัพธ์จริงใส่ state ***
          // ถ้า backend คืน data ภายใน { data: [...] } ฟังก์ชัน Search... ควรแปลงแล้ว
          const normalized = Array.isArray(results) ? results : [];
          // optional: map ผลลัพธ์ให้ตรงกับตารางถ้าชื่อฟิลด์ต่างกัน
          const mapped = normalized.map((r: any) => ({
            id: r.id ?? r.code ?? "",
            code: r.code ?? r.id ?? "",
            name: r.name ?? r.description ?? "",
            description: r.description ?? r.name ?? "",
            organization_id: r.organization_id ?? "",
            project_count: typeof r.project_count === "number" ? r.project_count : (Number(r.project_count) || 0),
            year: typeof r.year === "number" ? r.year : Number(r.year) || year_ce,
            display_order: typeof r.display_order === "number" ? r.display_order : 0,
          }));

          setQaIndicators(mapped);
          setIsLastPage(!mapped || mapped.length < 10);
          setLoading(false);
          return;
        }

        // Normal year-based fetch
        const items = await GetQaIndicatorsByYearFromApi(year_ce, usePage);
        setQaIndicators(Array.isArray(items) ? items : []);
        setIsLastPage(!items || items.length < 10);
        setLoading(false);
      } catch (err) {
        console.error("fetchList error", err);
        setQaIndicators([]);
        setIsLastPage(true);
        setLoading(false);
        toast.push("error", "โหลดข้อมูลล้มเหลว", "ไม่สามารถดึงตัวบ่งชี้จากเซิร์ฟเวอร์ได้");
      }
    },
    [year, page, toast]
  );


  const fetchCounts = useCallback(async () => {
    try {
      const data = await GetQaIndicatorsCountsByYearFromApi();
      set_count_data(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchCounts error", err);
      set_count_data([]);
    }
  }, []);

  // fetch whenever year/page/searchQuery changes
  useEffect(() => {
    fetchList(page, searchQuery);
  }, [fetchList, page, searchQuery]);

  // reset page when year or searchQuery changes
  useEffect(() => {
    setPage(1);
  }, [year, searchQuery]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // const filteredIndicators = useMemo(() => {
  //   // client-side filter on the current page only (optional)
  //   const q = query.trim().toLowerCase();
  //   if (!q) return qaIndicators;
  //   return qaIndicators.filter((it) => {
  //     const code = (it.code ?? it.id ?? "").toString().toLowerCase();
  //     const name = (it.name ?? it.description ?? "").toString().toLowerCase();
  //     const countStr = String(readProjectsCount(it));
  //     return code.includes(q) || name.includes(q) || countStr.includes(q);
  //   });
  // }, [qaIndicators, query]);
  const filteredIndicators = useMemo(() => {
    // ตารางจะแสดงผลจากข้อมูลที่ได้จาก API เท่านั้น
    // (การค้นหา/เรียก API จะเกิดเมื่อผู้ใช้กด "ค้นหา" หรือกด Enter ที่ input)
    return qaIndicators;
  }, [qaIndicators]);

  const selectedRecord = selectedQaId ? qaIndicators.find((q) => String(q.id) === String(selectedQaId)) ?? null : null;

  const handleAddQA = (newQA: any) => {
    const year_ce = beToCe(year) ?? undefined;
    const newRecord: GetQaIndicatorsByYearRespond = {
      id: newQA.code,
      code: newQA.code,
      name: newQA.name,
      description: newQA.description ?? "",
      organization_id: newQA.organization_id ?? "",
      project_count: newQA.projects ?? 0,
      year: year_ce ?? 0,
      display_order: newQA.display_order ?? 0,
    } as any;
    // optimistic: prepend when on first page
    setQaIndicators((s) => (page === 1 ? [newRecord, ...s.slice(0, 9)] : s));
    setShowAddModal(false);
  };

  const handleUpdateQA = useCallback(
    async (updated: any) => {
      try {
        const id = String(updated.id ?? updated.code ?? "");
        if (!id) {
          setSelectedQaId(null);
          await fetchList(page, searchQuery);
          return;
        }

        setQaIndicators((prev) => {
          const idx = prev.findIndex((p) => String(p.id) === id || String(p.code) === id);
          const newRec: GetQaIndicatorsByYearRespond = {
            id,
            code: updated.code ?? (idx > -1 ? prev[idx].code : id),
            name: updated.name ?? (idx > -1 ? prev[idx].name : ""),
            description: updated.description ?? (idx > -1 ? prev[idx].description : ""),
            organization_id: updated.organization_id ?? (idx > -1 ? prev[idx].organization_id : ""),
            project_count:
              typeof updated.project_count === "number"
                ? updated.project_count
                : idx > -1
                  ? prev[idx].project_count ?? 0
                  : 0,
            year: typeof updated.year === "number" ? updated.year : beToCe(year) ?? 0,
          } as any;

          if (idx > -1) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...newRec };
            return copy;
          } else {
            return [newRec, ...prev];
          }
        });

        setSelectedQaId(null);
        await fetchList(page, searchQuery);

        try {
          const counts = await GetQaIndicatorsCountsByYearFromApi();
          set_count_data(Array.isArray(counts) ? counts : []);
        } catch (e) {
          // ignore
        }

        toast.push("success", "อัปเดตสำเร็จ", `ตัวบ่งชี้ ${updated.name ?? updated.code ?? ""} ถูกอัปเดต`);
      } catch (err) {
        console.error("handleUpdateQA error", err);
        await fetchList(page, searchQuery);
        toast.push("error", "อัปเดตล้มเหลว", "เกิดข้อผิดพลาดขณะอัปเดตตัวบ่งชี้");
      }
    },
    [fetchList, page, year, toast, fetchCounts, searchQuery]
  );

  const handleView = (maybeIdOrNull: any, maybeInd?: any) => {
    const idCandidate = maybeIdOrNull ?? (maybeInd && (maybeInd.id ?? maybeInd.code ?? null));
    const id = idCandidate ? String(idCandidate) : null;
    if (id) {
      setSelectedQaId(id);
      return;
    }
    const local = qaIndicators.find(
      (q) =>
        String(q.code ?? q.id ?? "")
          .toString()
          .toLowerCase() === String(maybeInd?.code ?? maybeInd?.id ?? "").toLowerCase()
    );
    if (local?.id) {
      setSelectedQaId(String(local.id));
      return;
    }
  };

  const handleDelete = async (id: string | null, ind?: any) => {
    if (!id) return;
    const ok = window.confirm(`ลบตัวบ่งชี้ "${ind?.name ?? ind?.code ?? id}" จริงหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`);
    if (!ok) return;
    const prev = qaIndicators;
    setDeletingId(id);
    setQaIndicators((s) => s.filter((q) => String(q.id) !== String(id)));
    try {
      const success = await DeleteQaFromApi(String(id));
      setDeletingId(null);
      if (!success) {
        setQaIndicators(prev);
        toast.push("error", "ลบไม่สำเร็จ", "เซิร์ฟเวอร์ตอบกลับล้มเหลว");
        return;
      }
      try {
        await fetchCounts();
      } catch (e) { }
      // refresh current page
      await fetchList(page, searchQuery);
      toast.push("success", "ลบสำเร็จ", `ลบตัวบ่งชี้ "${ind?.name ?? ind?.code ?? id}" เรียบร้อย`);
    } catch (err: any) {
      setQaIndicators(prev);
      setDeletingId(null);
      console.error("delete error", err);
      toast.push("error", "เกิดข้อผิดพลาด", "ไม่สามารถลบตัวบ่งชี้ได้");
    }
  };

  const goPrev = () => {
    if (page <= 1) return;
    setPage((p) => p - 1);
  };
  const goNext = () => {
    if (isLastPage) return;
    setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen w-full">
      <QAHeader
        onAdd={() => setShowAddModal(true)}
        years={years}
        year={year}
        setYear={(y) => {
          setYear(y);
          setPage(1);
          setSearchQuery("");
          setQuery("");
        }}
      />

      <main className="py-2">
        <section className="mt-6 flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center px-4">
          <div className="relative w-full md:w-1/2">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              placeholder="ค้นหาตามโค้ด/ชื่อตัวบ่งชี้… (กด Enter หรือปุ่ม ค้นหา)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchQuery(query.trim());
                  setPage(1);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-20 py-2.5 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  // เคลียร์ input และ search state, ไปหน้าแรก และดึงข้อมูลปกติ
                  setQuery("");
                  setSearchQuery("");
                  setPage(1);
                  // fetchList อยู่ใน scope ของ component เป็น async function
                  try {
                    fetchList(1, ""); // เรียก API ดึงรายการปกติของปี (ไม่ใช้ search)
                  } catch (e) {
                    // ignore
                  }
                }}
                className="absolute right-18 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
                title="ล้าง"
                aria-label="ล้างการค้นหา"
              >
                <XIcon className="h-4 w-4 text-slate-400" />
              </button>
            )}

            <button
              onClick={() => {
                setSearchQuery(query.trim());
                setPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
            >
              ค้นหา
            </button>
          </div>
        </section>

        <section className="mt-6 mx-4">
          <div className="mb-2 flex items-center justify-between mx-4 my-2">
            <h3 className="text-sm font-semibold text-slate-800">ตัวบ่งชี้ QA ทั้งหมด</h3>
            <span className="text-xs text-slate-500">
              ปี {year} • หน้า {page} {isLastPage ? "(สุดท้าย)" : ""} {loading ? "• กำลังโหลด..." : ""}
            </span>
          </div>

          <div className="min-h-[420px] transition-all duration-200 ease-in-out">
            <QAIndicatorsTable
              qaIndicatorsData={filteredIndicators}
              onView={handleView}
              onDelete={handleDelete}
              currentPage={page}
              onPrev={goPrev}
              onNext={goNext}
              disableNext={isLastPage}
            />
          </div>
        </section>
      </main>

      {showAddModal && (
        <AddQAModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddQA}
          year={year}
          onSuccess={async () => {
            setPage(1);
            setSearchQuery("");
            setQuery("");
            await fetchList(1, "");
            await fetchCounts();
          }}
        />
      )}

      {selectedQaId && (
        <QADetailModal
          qaId={selectedQaId}
          initialData={selectedRecord ?? undefined}
          onClose={() => setSelectedQaId(null)}
          onUpdate={handleUpdateQA}
        />
      )}
    </div>
  );
}
