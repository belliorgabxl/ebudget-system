"use client";

import React, { useState, useEffect } from "react";
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
import { PlusCircle, Pencil, FileText, Loader2, Download, X, FolderCheck } from "lucide-react";

export function ProjectDetailClient({
  initialProject,
  isOwner = true,
  projectStatus,
}: {
  initialProject: Project;
  isOwner?: boolean;
  projectStatus?: string;
}) {
  const [project, setProject] = useState<Project>(initialProject);
  const isCompleted = projectStatus === "completed";
  // When completed, disable all editing
  const canEdit = isOwner && !isCompleted;
  const isApproved = project.budgetPlanStatus === "approved";

  const [editing, setEditing] = useState<EditKey | null>(null);
  const [savingKey, setSavingKey] = useState<EditKey | null>(null);

  // Progress state
  const [progressList, setProgressList] = useState<ProjectProgress[]>(
    initialProject.rawProgress ?? []
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProgress, setEditingProgress] = useState<ProjectProgress | null>(null);
  // file count map: progressId → count (undefined = not yet fetched)
  const [fileCounts, setFileCounts] = useState<Record<number, number>>({});

  // Closure document popup state
  const [closurePdfPopup, setClosurePdfPopup] = useState<{
    loading: boolean;
    docs: { id: string; file_name: string; original_file_name: string }[];
    selectedDocId: string | null;
    selectedDocName: string | null;
    pdfUrl: string | null;
  } | null>(null);

  const [downloadingClosure, setDownloadingClosure] = useState(false);

  const openClosureDocPopup = async () => {
    const closureRecord = project.closureRecord;
    if (!closureRecord?.id) return;
    setClosurePdfPopup({ loading: true, docs: [], selectedDocId: null, selectedDocName: null, pdfUrl: null });
    try {
      const res = await fetch(`/api/closure-records/${closureRecord.id}/documents`);
      const json = await res.json();
      const docs: { id: string; file_name: string; original_file_name: string }[] = Array.isArray(json?.data) ? json.data : [];
      if (docs.length === 0) {
        setClosurePdfPopup(null);
        toast.info("ไม่มีเอกสารปิดโครงการ");
        return;
      }
      const first = docs[0];
      const contentUrl = `/api/closure-records/${closureRecord.id}/documents/${first.id}/content`;
      setClosurePdfPopup({ loading: false, docs, selectedDocId: first.id, selectedDocName: first.file_name, pdfUrl: contentUrl });
    } catch {
      setClosurePdfPopup(null);
      toast.error("ไม่สามารถโหลดเอกสารได้");
    }
  };

  const selectClosureDoc = (doc: { id: string; file_name: string; original_file_name: string }) => {
    if (!closurePdfPopup || !project.closureRecord?.id) return;
    const contentUrl = `/api/closure-records/${project.closureRecord.id}/documents/${doc.id}/content`;
    setClosurePdfPopup((prev) => prev ? { ...prev, selectedDocId: doc.id, selectedDocName: doc.file_name, pdfUrl: contentUrl } : null);
  };

  const handleDownloadClosureDoc = async () => {
    if (!closurePdfPopup?.selectedDocId || !project.closureRecord?.id) return;
    setDownloadingClosure(true);
    try {
      const fileRes = await fetch(`/api/closure-records/${project.closureRecord.id}/documents/${closurePdfPopup.selectedDocId}/content`);
      if (!fileRes.ok) throw new Error(`HTTP ${fileRes.status}`);
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = closurePdfPopup.selectedDocName ?? "closure-document";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("ไม่สามารถดาวน์โหลดไฟล์ได้");
    } finally {
      setDownloadingClosure(false);
    }
  };

  const fetchFileCounts = (list: ProjectProgress[]) => {
    if (list.length === 0) return;
    Promise.allSettled(
      list.map((p) =>
        fetch(`/api/project-progress/${p.id}/files`)
          .then((r) => r.json())
          .then((json) => ({ id: p.id, count: Array.isArray(json?.data) ? json.data.length : 0 }))
          .catch(() => ({ id: p.id, count: 0 }))
      )
    ).then((results) => {
      const counts: Record<number, number> = {};
      results.forEach((r) => {
        if (r.status === "fulfilled") counts[r.value.id] = r.value.count;
      });
      setFileCounts(counts);
    });
  };

  useEffect(() => {
    fetchFileCounts(progressList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PDF popup state
  const [pdfPopup, setPdfPopup] = useState<{
    progressId: number;
    loading: boolean;
    files: { id: number; file_name: string }[];
    selectedFileId: number | null;
    selectedFileName: string | null;
    pdfUrl: string | null;
    pdfLoading: boolean;
  } | null>(null);

  const openFilePopup = async (progressId: number) => {
    setPdfPopup({ progressId, loading: true, files: [], selectedFileId: null, selectedFileName: null, pdfUrl: null, pdfLoading: false });
    try {
      const res = await fetch(`/api/project-progress/${progressId}/files`);
      const json = await res.json();
      const files: { id: number; file_name: string }[] = Array.isArray(json?.data) ? json.data : [];
      if (files.length === 0) {
        setPdfPopup(null);
        toast.info("ไม่มีไฟล์แนบ");
        return;
      }
      const firstFile = files[0];
      const contentUrl = `/api/project-progress/${progressId}/files/${firstFile.id}/content`;
      setPdfPopup({ progressId, loading: false, files, selectedFileId: firstFile.id, selectedFileName: firstFile.file_name, pdfUrl: contentUrl, pdfLoading: false });
    } catch {
      setPdfPopup(null);
      toast.error("ไม่สามารถโหลดไฟล์ได้");
    }
  };

  const selectPdfFile = (file: { id: number; file_name: string }) => {
    if (!pdfPopup) return;
    const contentUrl = `/api/project-progress/${pdfPopup.progressId}/files/${file.id}/content`;
    setPdfPopup((prev) => prev ? { ...prev, selectedFileId: file.id, selectedFileName: file.file_name, pdfUrl: contentUrl } : null);
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadFile = async (progressId: number, fileId: number, fileName: string) => {
    setDownloading(true);
    try {
      // Fetch file bytes through Next.js → Go backend → MinIO (same path as preview)
      const fileRes = await fetch(`/api/project-progress/${progressId}/files/${fileId}/content`);
      if (!fileRes.ok) throw new Error(`HTTP ${fileRes.status}`);
      const blob = await fileRes.blob();

      // Trigger browser download without navigating away
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("ไม่สามารถดาวน์โหลดไฟล์ได้");
    } finally {
      setDownloading(false);
    }
  };

  const refreshProgress = async () => {
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

      {/* PDF Popup Modal */}
      {pdfPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-base font-semibold text-gray-800">ไฟล์หลักฐาน</h2>
              <div className="flex items-center gap-3">
                {pdfPopup.pdfUrl && pdfPopup.selectedFileId && (
                  <button
                    onClick={() =>
                      handleDownloadFile(
                        pdfPopup.progressId,
                        pdfPopup.selectedFileId!,
                        pdfPopup.selectedFileName ?? "file.pdf"
                      )
                    }
                    disabled={downloading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition"
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    ดาวน์โหลด
                  </button>
                )}
                <button
                  onClick={() => setPdfPopup(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {/* Body */}
            {pdfPopup.loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                กำลังโหลด...
              </div>
            ) : (
              <div className="flex flex-1 min-h-0">
                {/* File list sidebar (only if multiple files) */}
                {pdfPopup.files.length > 1 && (
                  <div className="w-56 border-r border-gray-100 overflow-y-auto shrink-0 py-2">
                    {pdfPopup.files.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => selectPdfFile(f)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-indigo-50 transition ${
                          pdfPopup.selectedFileId === f.id
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{f.file_name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {/* PDF viewer */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-gray-100">
                  {pdfPopup.pdfLoading ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      กำลังโหลด PDF...
                    </div>
                  ) : pdfPopup.pdfUrl ? (
                    <iframe
                      key={pdfPopup.pdfUrl}
                      src={pdfPopup.pdfUrl}
                      className="flex-1 w-full h-full border-0"
                      title="ดูไฟล์ PDF"
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                      ไม่สามารถแสดง PDF ได้
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Closure info section (read-only, shown only when completed) */}
      {isCompleted && project.closureRecord && (
        <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-emerald-100">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-3">
              <FolderCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-emerald-700">ข้อมูลการปิดโครงการ</h3>
            </div>
            {(project.closureRecord.documents?.length ?? 0) > 0 && (
              <button
                onClick={openClosureDocPopup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition"
              >
                <FileText className="h-3.5 w-3.5" />
                ดูเอกสารปิดโครงการ ({project.closureRecord.documents?.length ?? 0})
              </button>
            )}
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="md:col-span-2 rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>ยอดใช้งบประมาณจริง</span>
                <span className="font-semibold tabular-nums">
                  {project.closureRecord.actual_budget_used.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
              <div className={`flex justify-between font-semibold border-t border-gray-200 pt-1 ${
                project.closureRecord.variance_from_planned < 0 ? "text-red-600" : "text-emerald-700"
              }`}>
                <span>ส่วนต่างจากแผน</span>
                <span className="tabular-nums">
                  {project.closureRecord.variance_from_planned < 0 ? "-" : "+"}
                  {Math.abs(project.closureRecord.variance_from_planned).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
            </div>
            {project.closureRecord.variance_reason && (
              <div className="md:col-span-2">
                <p className="text-xs font-medium text-gray-500 mb-1">เหตุผลของส่วนต่างงบประมาณ</p>
                <p className="text-gray-800 whitespace-pre-line">{project.closureRecord.variance_reason}</p>
              </div>
            )}
            {project.closureRecord.outcome_description && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">สรุปผลลัพธ์โครงการ</p>
                <p className="text-gray-800 whitespace-pre-line">{project.closureRecord.outcome_description}</p>
              </div>
            )}
            {project.closureRecord.lessons_learned && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">บทเรียนที่ได้รับ</p>
                <p className="text-gray-800 whitespace-pre-line">{project.closureRecord.lessons_learned}</p>
              </div>
            )}
            {project.closureRecord.development_recommendations && (
              <div className="md:col-span-2">
                <p className="text-xs font-medium text-gray-500 mb-1">ข้อเสนอแนะเพื่อพัฒนา</p>
                <p className="text-gray-800 whitespace-pre-line">{project.closureRecord.development_recommendations}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Closure document popup */}
      {closurePdfPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-base font-semibold text-gray-800">เอกสารปิดโครงการ</h2>
              <div className="flex items-center gap-2">
                {closurePdfPopup.selectedDocId && (
                  <button
                    onClick={handleDownloadClosureDoc}
                    disabled={downloadingClosure}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    {downloadingClosure ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    ดาวน์โหลด
                  </button>
                )}
                <button onClick={() => setClosurePdfPopup(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {closurePdfPopup.loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                กำลังโหลด...
              </div>
            ) : (
              <div className="flex flex-1 min-h-0">
                {closurePdfPopup.docs.length > 1 && (
                  <div className="w-56 border-r border-gray-100 overflow-y-auto shrink-0 py-2">
                    {closurePdfPopup.docs.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => selectClosureDoc(d)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-emerald-50 transition ${
                          closurePdfPopup.selectedDocId === d.id
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{d.file_name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-gray-100">
                  {closurePdfPopup.pdfUrl ? (
                    <iframe src={closurePdfPopup.pdfUrl} className="flex-1 w-full h-full border-0" title="เอกสารปิดโครงการ" />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">ไม่สามารถแสดงไฟล์ได้</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <GeneralInfoSection
        project={project.generalInfo}
        canEdit={canEdit && (editing === null || editing === "general")}
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
          {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            เพิ่มความคืบหน้า
          </button>
          )}
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
                  {canEdit && <th className="px-4 py-2.5 text-center w-20">แก้ไข</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {progressList.map((p) => {
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
                          {(fileCounts[p.id] ?? 0) > 0 && (
                            <button
                              onClick={() => openFilePopup(p.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              ดูไฟล์
                            </button>
                          )}
                        </td>
                        {canEdit && (
                          <td className="px-4 py-2.5 text-center">
                            <button
                              onClick={() => setEditingProgress(p)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              แก้ไข
                            </button>
                          </td>
                        )}
                      </tr>
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
        canEdit={canEdit && (editing === null || editing === "budget")}
        isEditing={isEditing("budget")}
        isSaving={isSaving("budget")}
        onEdit={() => beginEdit("budget")}
        onCancel={cancelEdit}
        onSave={saveBudget}
      />
      <KpiSection
        projectId={project.id}
        selectedKpis={project.kpi ?? []}
        canEdit={canEdit && (editing === null || editing === "kpi")}
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
        canEdit={canEdit && (editing === null || editing === "expect")}
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
