"use client";

import React, { useState } from "react";
import { GeneralInfoSection } from "../sections/GeneralSection";
import { Project } from "@/types/project";
import { toast } from "react-toastify";
import { GeneralInfoForUpdateData, ProjectKPI, ProjectProgress } from "@/dto/projectDto";
import {
  updateBudgetPlanByProject,
  updateProjectDetail,
  updateProjectKpis,
  updateProjectObjectivesOutcomes,
} from "@/api/project.client";
import { EditKey } from "@/constants/project";
import { BudgetSection } from "../sections/BudgetSection";
import { toBudgetSourceType, toNumber } from "@/lib/helper";
import { BudgetSectionDraft } from "@/dto/sectionupdate";
import { KpiSection } from "../sections/KpiSection";
import { ObjectiveOutcomeSection } from "../sections/ObjectiveOutcomeSection";
import AddProgressModal from "../AddProgressModal";
import EditProgressModal from "../EditProgressModal";
import { PlusCircle, Pencil, FileText, Loader2, Download } from "lucide-react";

export function ProjectDetailClient({
  initialProject,
}: {
  initialProject: Project;
}) {
  const [project, setProject] = useState<Project>(initialProject);
  const isApproved = project.budgetPlanStatus === "approved";

  const [editing, setEditing] = useState<EditKey | null>(null);
  const [savingKey, setSavingKey] = useState<EditKey | null>(null);

  // Progress state
  const [progressList, setProgressList] = useState<ProjectProgress[]>(
    initialProject.rawProgress ?? []
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProgress, setEditingProgress] = useState<ProjectProgress | null>(null);
  // Track open file rows (lazy load)
  const [fileRows, setFileRows] = useState<
    Record<number, { loading: boolean; files: { id: number; file_name: string }[] }>
  >({});

  const toggleFiles = async (progressId: number) => {
    if (fileRows[progressId]) {
      // Toggle off
      setFileRows((prev) => {
        const next = { ...prev };
        delete next[progressId];
        return next;
      });
      return;
    }
    setFileRows((prev) => ({ ...prev, [progressId]: { loading: true, files: [] } }));
    try {
      const res = await fetch(`/api/project-progress/${progressId}/files`);
      const json = await res.json();
      const files = Array.isArray(json?.data) ? json.data : [];
      setFileRows((prev) => ({ ...prev, [progressId]: { loading: false, files } }));
    } catch {
      setFileRows((prev) => ({ ...prev, [progressId]: { loading: false, files: [] } }));
    }
  };

  const downloadFile = async (progressId: number, fileId: number) => {
    try {
      const res = await fetch(`/api/project-progress/${progressId}/files/${fileId}/download-url`);
      const json = await res.json();
      const url = json?.data?.url ?? json?.data;
      if (!url) throw new Error("ไม่พบ URL");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("ไม่สามารถดาวน์โหลดไฟล์ได้");
    }
  };

  const refreshProgress = async () => {
    // Re-fetch: just reload the page (simplest) or reload from API
    // For simplicity, refresh the page
    window.location.reload();
  };

  const isEditing = (k: EditKey) => editing === k;
  const isSaving = (k: EditKey) => savingKey === k;

  const beginEdit = (k: EditKey) => setEditing(k);
  const cancelEdit = () => setEditing(null);

  const saveGeneralInfo = async (draft: GeneralInfoForUpdateData) => {
    try {
      setSavingKey("general");
      await updateProjectDetail(draft);

      setProject((p) => ({
        ...p,
        generalInfo: draft,
      }));

      toast.success("บันทึกข้อมูลทั่วไปสำเร็จ");
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSavingKey(null);
    }
  };

  const saveBudget = async (
    draft: BudgetSectionDraft,
    computedTotal: number
  ) => {
    try {
      setSavingKey("budget");

      const payload = {
        project_id: project.id,
        budget_amount: computedTotal,
        budget_source: toBudgetSourceType(draft.budget_source),
        budget_source_department:
          draft.budget_source === "external"
            ? draft.budget_source_department ?? ""
            : "",
        budget_items: (draft.budget_items ?? []).map((it, idx) => ({
          id: idx + 1,
          name: it.name ?? "",
          amount: toNumber(it.amount),
          remark: it.remark ?? "",
        })),
      };

      await updateBudgetPlanByProject(payload);

      setProject((p) => ({
        ...p,
        budget: {
          rows: payload.budget_items.map((x, idx) => ({
            id: idx + 1,
            name: x.name,
            amount: String(x.amount),
            remark: x.remark,
          })),
          total: payload.budget_amount,
          sources: {
            source: payload.budget_source,
            externalAgency: payload.budget_source_department,
          },
        },
      }));

      toast.success("บันทึกงบประมาณสำเร็จ");
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.message || "บันทึกงบประมาณไม่สำเร็จ");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6 mb-20">
      {showAddModal && (
        <AddProgressModal
          projectId={project.id}
          onClose={() => setShowAddModal(false)}
          onSuccess={refreshProgress}
        />
      )}
      {editingProgress && (
        <EditProgressModal
          progress={editingProgress}
          onClose={() => setEditingProgress(null)}
          onSuccess={refreshProgress}
        />
      )}

      <GeneralInfoSection
        project={project.generalInfo}
        canEdit={editing === null || editing === "general"}
        isEditing={isEditing("general")}
        isSaving={isSaving("general")}
        onEdit={() => beginEdit("general")}
        onCancel={cancelEdit}
        onSave={saveGeneralInfo}
      />
      
      {/* Progress table */}
      <div className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-indigo-50 border-indigo-100">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-indigo-700">ความคืบหน้าของโครงการ</h3>
            <span className="text-sm text-gray-500">ทั้งหมด <b className="text-indigo-700">{progressList.length}</b> รายการ</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            เพิ่มความคืบหน้า
          </button>
        </div>
        {progressList.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400 italic">ยังไม่มีข้อมูลความคืบหน้า</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs font-semibold">
                <tr>
                  <th className="px-4 py-2.5 text-center w-12">ลำดับ</th>
                  <th className="px-4 py-2.5 text-left">รายการกิจกรรม / คำอธิบาย</th>
                  <th className="px-4 py-2.5 text-center w-32">วันที่เริ่มต้น</th>
                  <th className="px-4 py-2.5 text-center w-32">วันที่สิ้นสุด</th>
                  <th className="px-4 py-2.5 text-left w-36">ผู้รับผิดชอบ</th>
                  <th className="px-4 py-2.5 text-right w-32">ยอดใช้จริง (บาท)</th>
                  <th className="px-4 py-2.5 text-center w-28">ไฟล์หลักฐาน</th>
                  <th className="px-4 py-2.5 text-center w-20">แก้ไข</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {progressList.map((p) => {
                  const fileState = fileRows[p.id];
                  return (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-2.5 text-center text-gray-400">{p.sequence_number}</td>
                        <td className="px-4 py-2.5 text-gray-800 whitespace-pre-line">{p.description || "—"}</td>
                        <td className="px-4 py-2.5 text-center text-gray-500">
                          {p.start_date ? new Date(p.start_date).toLocaleDateString("th-TH") : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-500">
                          {p.end_date ? new Date(p.end_date).toLocaleDateString("th-TH") : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{p.responsible_name || "—"}</td>
                        <td className="px-4 py-2.5 text-right text-gray-700 tabular-nums">
                          {p.budget_cost_used != null
                            ? p.budget_cost_used.toLocaleString("th-TH", { minimumFractionDigits: 2 })
                            : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => toggleFiles(p.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {fileState ? "ซ่อน" : "ดูไฟล์"}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => setEditingProgress(p)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            แก้ไข
                          </button>
                        </td>
                      </tr>
                      {fileState && (
                        <tr key={`files-${p.id}`} className="bg-blue-50/40">
                          <td colSpan={8} className="px-8 py-2">
                            {fileState.loading ? (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                กำลังโหลดไฟล์...
                              </div>
                            ) : fileState.files.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">ไม่มีไฟล์แนบ</p>
                            ) : (
                              <ul className="flex flex-wrap gap-2">
                                {fileState.files.map((f) => (
                                  <li key={f.id}>
                                    <button
                                      onClick={() => downloadFile(p.id, f.id)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 transition shadow-sm"
                                    >
                                      <Download className="h-3 w-3" />
                                      {f.file_name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <BudgetSection
        projectId={project.id}
        budget={project.budget}
        canEdit={editing === null || editing === "budget"}
        isEditing={isEditing("budget")}
        isSaving={isSaving("budget")}
        onEdit={() => beginEdit("budget")}
        onCancel={cancelEdit}
        onSave={saveBudget}
      />
      <KpiSection
        projectId={project.id}
        selectedKpis={project.kpi ?? []}
        canEdit={editing === null || editing === "kpi"}
        isEditing={isEditing("kpi")}
        isSaving={isSaving("kpi")}
        onEdit={() => beginEdit("kpi")}
        onCancel={cancelEdit}
        // loadKpis={}
        onSave={async (draft) => {
          try {
            setSavingKey("kpi");

            await updateProjectKpis({
              project_id: project.id,
              kpi_ids: draft.kpi_ids,
            });

            // Reload KPI masters to get updated names
            const mastersRes = await fetch("/api/kpis", { cache: "no-store" });
            const masters: { id: number; name: string; type: string }[] = mastersRes.ok ? await mastersRes.json() : [];

            const newSelected: ProjectKPI[] = draft.kpi_ids
              .map((id) => {
                const m = masters.find((x) => x.id === id);
                if (!m) return null;
                return {
                  id: m.id,
                  indicator: m.name,
                  target_value: "",
                  description: "",
                } as ProjectKPI;
              })
              .filter(Boolean) as ProjectKPI[];

            setProject((p) => ({
              ...p,
              kpi: newSelected,
            }));

            toast.success("บันทึก KPI สำเร็จ");
            setEditing(null);
          } catch (e: any) {
            toast.error(e?.message || "บันทึก KPI ไม่สำเร็จ");
          } finally {
            setSavingKey(null);
          }
        }}
      />
      <ObjectiveOutcomeSection
        projectId={project.id}
        initialObjectives={
          project.project_objectives_and_outcomes
            ?.filter((x) => x.type === "objective")
            .map((x) => ({ id: x.id, description: x.description })) ?? []
        }
        initialExpectations={
          project.project_objectives_and_outcomes
            ?.filter((x) => x.type === "expectation")
            .map((x) => ({ id: x.id, description: x.description })) ?? []
        }
        canEdit={editing === null || editing === "expect"}
        isEditing={isEditing("expect")}
        isSaving={isSaving("expect")}
        onEdit={() => beginEdit("expect")}
        onCancel={cancelEdit}
        onSave={async (draft) => {
          try {
            setSavingKey("expect");

            const objectives = (draft.objectives ?? [])
              .map((o) => ({ ...o, description: (o.description ?? "").trim() }))
              .filter((o) => o.description);

            const expectations = (draft.expectations ?? [])
              .map((o) => ({ ...o, description: (o.description ?? "").trim() }))
              .filter((o) => o.description);

            await updateProjectObjectivesOutcomes({
              project_id: project.id,
              objectives: [
                ...objectives.map((o) => ({
                  id: o.id ?? 0,
                  description: o.description,
                  type: "objective" as const,
                })),
                ...expectations.map((o) => ({
                  id: o.id ?? 0,
                  description: o.description,
                  type: "expectation" as const,
                })),
              ],
            });

            setProject((p) => ({
              ...p,
              project_objectives_and_outcomes: [
                ...objectives.map((o, idx) => ({
                  id: o.id ?? -(idx + 1),
                  project_id: project.id,
                  type: "objective" as const,
                  description: o.description,
                })),
                ...expectations.map((o, idx) => ({
                  id: o.id ?? -(1000 + idx + 1),
                  project_id: project.id,
                  type: "expectation" as const,
                  description: o.description,
                })),
              ],
            }));

            toast.success("บันทึกวัตถุประสงค์และผลที่คาดว่าจะได้รับสำเร็จ");
            setEditing(null);
          } catch (e: any) {
            toast.error(e?.message || "บันทึกไม่สำเร็จ");
          } finally {
            setSavingKey(null);
          }
        }}
      />
    </div>
  );
}
