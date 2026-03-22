"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  Target,
  Star,
  Loader2,
  FolderOpen,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import BackGroundLight from "@/components/background/bg-light";
import { toast } from "react-toastify";
import type { RegularWorkTemplate } from "@/dto/projectDto";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectRow = {
  id: string;
  name: string;
  code: string;
  status: string;
  plan_type: string;
  total_budget: number;
  created_at: string;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  color = "indigo",
  children,
}: {
  icon: React.ElementType;
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
    green: "bg-green-50 border-green-100 text-green-600",
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
  };
  const cls = colorMap[color] ?? colorMap.indigo;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`flex items-center gap-2 px-5 py-3 border-b ${cls}`}>
        <Icon className="h-5 w-5" />
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function EmptyText({ text = "ไม่มีข้อมูล" }: { text?: string }) {
  return <p className="text-sm text-gray-400 italic">{text}</p>;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: "ร่าง", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  in_progress: { label: "กำลังดำเนินการ", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  on_hold: { label: "หยุดชั่วคราว", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  done: { label: "เสร็จสิ้น", cls: "bg-green-100 text-green-700 border-green-200" },
};

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmCls,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmCls: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 whitespace-pre-line mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm rounded-lg font-medium text-white ${confirmCls}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RegularWorkTemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [template, setTemplate] = useState<RegularWorkTemplate | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"delete" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTemplate = useCallback(async () => {
    try {
      const res = await fetch(`/api/regular-work-templates/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setTemplate(json.data);
      } else {
        setError(json.message ?? "ไม่พบข้อมูลแผนงาน");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
  }, [id]);

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const res = await fetch(`/api/regular-work-templates/${id}/projects`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setProjects(Array.isArray(json.data) ? json.data : []);
        setTotalBudget(json.total_budget ?? 0);
      }
    } catch {
      /* ignore */
    } finally {
      setProjectsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([loadTemplate(), loadProjects()]).finally(() => setLoading(false));
  }, [id, loadTemplate, loadProjects]);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/regular-work-templates/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        const raw = json.message ?? "ลบไม่สำเร็จ";
        const msg = raw.includes(": ") ? raw.split(": ").slice(1).join(": ") : raw;
        throw new Error(msg);
      }
      toast.success("ลบแผนงานประจำสำเร็จ");
      router.push("/organizer/projects/regular-work-project");
    } catch (err: any) {
      toast.error(err?.message ?? "ลบไม่สำเร็จ");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/regular-work-templates/${id}`, { method: "PATCH" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? "เปลี่ยนสถานะไม่สำเร็จ");
      toast.success(json.data?.is_active ? "เปิดใช้งานแผนงานแล้ว" : "ปิดใช้งานแผนงานแล้ว");
      await loadTemplate();
    } catch (err: any) {
      toast.error(err?.message ?? "เปลี่ยนสถานะไม่สำเร็จ");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <BackGroundLight>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </BackGroundLight>
    );
  }

  if (error || !template) {
    return (
      <BackGroundLight>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
          <BookOpen className="h-12 w-12" />
          <p className="text-base">{error ?? "ไม่พบข้อมูล"}</p>
          <button onClick={() => router.back()} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
          </button>
        </div>
      </BackGroundLight>
    );
  }

  const hasProjects = projects.length > 0;
  const cannotDisable = template.is_active && projects.some((p) => p.status !== "done");

  return (
    <BackGroundLight>
      {confirm === "delete" && (
        <ConfirmModal
          title="ลบแผนงานประจำ"
          message={`คุณต้องการลบ "${template.name}" ใช่หรือไม่?\nการลบจะไม่สามารถยกเลิกได้`}
          confirmLabel={actionLoading ? "กำลังลบ..." : "ลบ"}
          confirmCls="bg-red-600 hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
      <main className="w-full lg:px-18 md:px-10 sm:px-5 px-1 py-6">
        <div className="lg:px-20 lg:pt-0 pt-10 px-2 mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-4">
            <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
          </button>

          {/* Title card */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-6 py-5 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-white/20 rounded-xl p-3">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold leading-snug">{template.name}</h1>
                {template.description && (
                  <p className="mt-1 text-sm text-indigo-100 line-clamp-3">{template.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    {template.plan_type === "regular_work" ? "แผนงานประจำ" : template.plan_type}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${template.is_active ? "bg-green-400/30 text-green-100" : "bg-gray-400/30 text-gray-100"}`}>
                    {template.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div
                  className="flex flex-col items-center gap-1"
                  title={cannotDisable ? "ไม่สามารถปิดได้ เนื่องจากมีโครงการที่ยังดำเนินการอยู่" : (template.is_active ? "คลิกเพื่อปิดใช้งาน" : "คลิกเพื่อเปิดใช้งาน")}
                >
                  <button
                    onClick={() => !cannotDisable && !actionLoading && handleToggle()}
                    disabled={actionLoading || cannotDisable}
                    aria-pressed={template.is_active}
                    className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none ${template.is_active ? "bg-green-400" : "bg-gray-500"} ${cannotDisable || actionLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${template.is_active ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className="text-xs text-white/80">{template.is_active ? "เปิดอยู่" : "ปิดอยู่"}</span>
                </div>
                <button
                  onClick={() => setConfirm("delete")}
                  disabled={actionLoading || hasProjects}
                  title={hasProjects ? "ไม่สามารถลบได้เนื่องจากมีโครงการอยู่" : "ลบแผนงาน"}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-500/80 hover:bg-red-600/80 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" /> ลบ
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:px-20 px-2 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard icon={Target} title="เป้าหมาย" color="blue">
              {template.quantitative_goal || template.qualitative_goal ? (
                <div className="space-y-3">
                  {template.quantitative_goal && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">เชิงปริมาณ</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{template.quantitative_goal}</p>
                    </div>
                  )}
                  {template.qualitative_goal && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">เชิงคุณภาพ</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{template.qualitative_goal}</p>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyText />
              )}
            </SectionCard>

            <SectionCard icon={Star} title="หลักการและเหตุผล" color="yellow">
              {template.rationale ? (
                <div className="space-y-3">
                  {template.rationale.split(/\n{2,}/).map((para, i) => (
                    <p key={i} className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {para.trim()}
                    </p>
                  ))}
                </div>
              ) : (
                <EmptyText />
              )}
            </SectionCard>
          </div>

          {/* Projects table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-indigo-50 border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <FolderOpen className="h-5 w-5" />
                <h2 className="font-semibold text-sm">โครงการที่ใช้แผนงานนี้</h2>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">จำนวน <b className="text-indigo-700">{projects.length}</b> โครงการ</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">
                  งบรวม <b className="text-indigo-700">{totalBudget.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</b> บาท
                </span>
              </div>
            </div>
            {projectsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              </div>
            ) : projects.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-gray-400 italic">
                ยังไม่มีโครงการที่ใช้แผนงานนี้
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[580px] text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-2 text-center w-10">No.</th>
                      <th className="px-4 py-2 text-left">ชื่อโครงการ</th>
                      <th className="px-4 py-2 text-center w-24">รหัส</th>
                      <th className="px-4 py-2 text-center w-32">สถานะ</th>
                      <th className="px-4 py-2 text-right w-36">งบประมาณ (บาท)</th>
                      <th className="px-4 py-2 text-center w-24">วันที่สร้าง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projects.map((p, idx) => {
                      const st = STATUS_MAP[p.status] ?? { label: p.status, cls: "bg-gray-100 text-gray-600 border-gray-200" };
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                          onClick={() => router.push(`/organizer/projects/${p.id}/details`)}
                        >
                          <td className="px-4 py-2.5 text-center text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-900">{p.name}</td>
                          <td className="px-4 py-2.5 text-center text-gray-500 font-mono text-xs">{p.code || "—"}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.cls}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-700">
                            {p.total_budget > 0 ? p.total_budget.toLocaleString("th-TH", { minimumFractionDigits: 2 }) : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-center text-gray-500 text-xs">{p.created_at}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </BackGroundLight>
  );
}

