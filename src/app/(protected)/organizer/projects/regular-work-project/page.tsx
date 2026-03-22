"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import BackGroundLight from "@/components/background/bg-light";
import { LoadData } from "@/components/project/LoadData";
import { toast } from "react-toastify";
import type { RegularWorkTemplate } from "@/dto/projectDto";

type ListResp = {
  success: boolean;
  data: RegularWorkTemplate[];
  total: number;
  page: number;
  limit: number;
};

const getPlanTypeBadge = (planType: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    regular_work: { label: "แผนงานประจำ", cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    project: { label: "ทั่วไป", cls: "bg-gray-100 text-gray-700 border-gray-200" },
  };
  const cfg = map[planType] ?? { label: planType, cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

export default function RegularWorkProjectPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<RegularWorkTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const totalPages = Math.ceil(total / limit);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        qs.set("page", String(page));
        qs.set("limit", String(limit));
        if (search) qs.set("name", search);

        const res = await fetch(`/api/regular-work-templates?${qs.toString()}`, {
          cache: "no-store",
        });
        const json: ListResp = await res.json();
        if (cancelled) return;
        if (json.success) {
          setTemplates(json.data ?? []);
          setTotal(json.total ?? 0);
        } else {
          setTemplates([]);
          setTotal(0);
        }
      } catch {
        if (!cancelled) { setTemplates([]); setTotal(0); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, limit, search]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <BackGroundLight>
      <main className="w-full lg:px-18 md:px-10 sm:px-5 px-1 py-6">
        {/* Header */}
        <div className="lg:px-20 lg:pt-0 pt-10 px-2 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="h-7 w-7 text-indigo-600" />
            <h1 className="text-2xl font-semibold text-gray-900">แผนงานประจำ</h1>
          </div>
          <p className="text-sm text-gray-500">รายการแผนงานประจำขององค์กร</p>

          {/* Summary */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-100 px-5 py-3">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <span className="text-sm text-gray-600">แผนงานประจำทั้งหมด</span>
            <span className="text-lg font-bold text-indigo-700">{total}</span>
            <span className="text-sm text-gray-500">รายการ</span>
          </div>
        </div>

        {/* Search */}
        <div className="lg:px-20 px-2 mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex gap-2 w-full sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="ค้นหาแผนงาน..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              ค้นหา
            </button>
          </div>
          <button
            onClick={() => router.push("/organizer/projects/regular-work-project/new")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" /> สร้างแผนงานประจำใหม่
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadData />
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <BookOpen className="h-12 w-12 mb-3" />
            <p className="text-base">ไม่พบแผนงานประจำในระบบ</p>
          </div>
        ) : (
          <div className="lg:px-20 px-2">
            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-indigo-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold w-12">No.</th>
                    <th className="px-4 py-3 text-left font-semibold">ชื่อแผนงาน</th>
                    <th className="px-4 py-3 text-left font-semibold">รายละเอียด</th>
                    <th className="px-4 py-3 text-center font-semibold w-36">ประเภท</th>
                    <th className="px-4 py-3 text-center font-semibold w-24">สถานะ</th>
                    <th className="px-4 py-3 text-center font-semibold w-36">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {templates.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-500">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1">{t.name}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 line-clamp-2 max-w-xs">
                        {t.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getPlanTypeBadge(t.plan_type)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            t.is_active
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {t.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => router.push(`/organizer/projects/regular-work-project/${t.id}`)}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          ดู
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                  แสดง {(page - 1) * limit + 1}–{Math.min(page * limit, total)} จาก {total} รายการ
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!canPrev}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
                  </button>
                  <span className="px-2">
                    หน้า {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!canNext}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ถัดไป <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </BackGroundLight>
  );
}
