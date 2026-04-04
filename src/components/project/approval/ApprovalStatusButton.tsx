"use client";

import Link from "next/link";
import { SquareArrowUp, Clock, XCircle, Flag, CheckCircle, Ban, FileText, X, Trash2, Upload, ClipboardList, CalendarDays, AlertTriangle, Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ProcessStep } from "../details/ProgressDetail";

interface ApprovalStatusButtonProps {
  projectId: string;
  budgetPlanId?: string;
  status: string;
  projectStatus?: string;
  processSteps?: ProcessStep[];
  progressList?: { budget_cost_used?: number | string | null }[];
  budgetTotal?: number;
  startDate?: string | null;
  endDate?: string | null;
}

export default function ApprovalStatusButton({
  projectId,
  budgetPlanId,
  status,
  projectStatus,
  processSteps,
  progressList,
  budgetTotal = 0,
  startDate,
  endDate,
}: ApprovalStatusButtonProps) {
  const router = useRouter();
  const [showDoneConfirm, setShowDoneConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Form fields for closure
  const [outcomeDescription, setOutcomeDescription] = useState("");
  const [developmentRecommendations, setDevelopmentRecommendations] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [varianceReason, setVarianceReason] = useState("");
  const [closureFile, setClosureFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate budget summary
  const actualBudgetUsed = (progressList ?? []).reduce((sum, p) => {
    const v = p.budget_cost_used;
    return sum + (v != null && v !== "" ? parseFloat(String(v)) || 0 : 0);
  }, 0);
  const varianceFromPlanned = budgetTotal - actualBudgetUsed;

  const canComplete =
    !progressList ||
    progressList.length === 0 ||
    progressList.every(
      (p) => p.budget_cost_used !== null && p.budget_cost_used !== undefined && p.budget_cost_used !== ""
    );

  // Warning flags for final confirm
  const isEarlyClose = endDate ? new Date() < new Date(endDate) : false;
  const hasNoFile = !closureFile;

  const toThaiDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "2-digit" });
  };

  const onNavigationToProcess = (budgetPlanId: string) => {
    router.push(`/organizer/approve/process/${budgetPlanId}`);
  };

  const resetForm = () => {
    setOutcomeDescription("");
    setDevelopmentRecommendations("");
    setLessonsLearned("");
    setVarianceReason("");
    setClosureFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCompleteProject = async () => {
    setCompleting(true);
    try {
      const formData = new FormData();
      formData.append("outcome_description", outcomeDescription);
      formData.append("development_recommendations", developmentRecommendations);
      formData.append("lessons_learned", lessonsLearned);
      formData.append("variance_reason", varianceReason);
      if (closureFile) {
        formData.append("file", closureFile);
      }

      const res = await fetch(`/api/projects/${projectId}/close`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        resetForm();
        setShowDoneConfirm(false);
        window.location.reload();
      }
    } catch {
      // silently handle; status update is best-effort
    } finally {
      setCompleting(false);
    }
  };

  if (status === "draft") {
    return (
      <Link
        href={`/organizer/projects/approval/${projectId}`}
        className="rounded-md flex justify-center items-center gap-3
          bg-indigo-600 px-4 py-2 text-sm font-medium text-white
          hover:scale-[102%] hover:bg-indigo-700 transition"
      >
        <SquareArrowUp className="h-5 w-5" />
        ยื่นอนุมัติโครงการ
      </Link>
    );
  }

  if (status === "approved") {
    // Project already completed → show static badge
    if (projectStatus === "completed") {
      return (
        <div className="rounded-md flex justify-center items-center gap-2 bg-green-600 px-4 py-2 text-sm font-medium text-white cursor-default">
          <CheckCircle className="h-4 w-4" />
          โครงการเสร็จสิ้นแล้ว
        </div>
      );
    }
    return (
      <div className="flex gap-1 flex-wrap items-center">
        {/* Done confirm dialog */}
        {showDoneConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto py-8">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 my-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">เสร็จสิ้นโครงการ</h2>
                  <p className="text-sm text-gray-500 mt-0.5">กรุณากรอกข้อมูลสรุปโครงการก่อนยืนยัน (ไม่บังคับ)</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowDoneConfirm(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Project duration info */}
              {(startDate || endDate) && (
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2 text-xs text-indigo-700 flex justify-between gap-4">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> วันเริ่มโครงการ: <b>{toThaiDate(startDate)}</b></span>
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> วันสิ้นสุดโครงการ: <b>{toThaiDate(endDate)}</b></span>
                </div>
              )}

              {/* Budget summary */}
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>งบประมาณที่วางแผน</span>
                  <span className="font-medium tabular-nums">
                    {budgetTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ยอดใช้จริงรวม</span>
                  <span className="font-medium tabular-nums">
                    {actualBudgetUsed.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
                <div className={`flex justify-between font-semibold border-t border-gray-200 pt-1 ${varianceFromPlanned < 0 ? "text-red-600" : "text-emerald-700"}`}>
                  <span>ส่วนต่างจากแผน (ประหยัด / เกิน)</span>
                  <span className="tabular-nums">
                    {varianceFromPlanned < 0 ? "-" : "+"}
                    {Math.abs(varianceFromPlanned).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
              </div>

              {/* Optional text fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    สรุปผลลัพธ์โครงการ <span className="text-gray-400">(ไม่บังคับ)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={outcomeDescription}
                    onChange={(e) => setOutcomeDescription(e.target.value)}
                    placeholder="สิ่งที่โครงการนี้บรรลุผลสำเร็จ..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    บทเรียนที่ได้รับ <span className="text-gray-400">(ไม่บังคับ)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={lessonsLearned}
                    onChange={(e) => setLessonsLearned(e.target.value)}
                    placeholder="สิ่งที่เรียนรู้จากโครงการนี้..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ข้อเสนอแนะเพื่อพัฒนา <span className="text-gray-400">(ไม่บังคับ)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={developmentRecommendations}
                    onChange={(e) => setDevelopmentRecommendations(e.target.value)}
                    placeholder="ข้อเสนอแนะสำหรับโครงการในอนาคต..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    เหตุผลของส่วนต่างงบประมาณ <span className="text-gray-400">(ไม่บังคับ)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={varianceReason}
                    onChange={(e) => setVarianceReason(e.target.value)}
                    placeholder="เหตุผลที่งบประมาณต่างจากแผน..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    เอกสารปิดโครงการ{" "}
                    <span className="text-gray-400 font-normal">(ไฟล์ PDF สูงสุด 30 MB)</span>
                  </label>
                  {closureFile ? (
                    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-700 truncate">{closureFile.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          ({(closureFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setClosureFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors w-full justify-center"
                    >
                      <Upload className="h-4 w-4" />
                      เลือกไฟล์ PDF
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (f && f.size > 30 * 1024 * 1024) {
                        alert("ไฟล์มีขนาดเกิน 30 MB");
                        e.target.value = "";
                        return;
                      }
                      setClosureFile(f);
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => { setShowDoneConfirm(false); resetForm(); }}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => setShowFinalConfirm(true)}
                  disabled={completing}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
                >
                  ยืนยันเสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Final warning confirmation popup */}
        {showFinalConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
                  <Flag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">ยืนยันปิดโครงการ</h2>
                  <p className="text-sm text-gray-500">คุณต้องการยืนยันการปิดโครงการนี้ใช่หรือไม่?</p>
                </div>
              </div>

              {/* Always-show danger warning */}
              <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-800 font-medium flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>เมื่อปิดโครงการแล้ว จะไม่สามารถกลับไปแก้ไขหรือเปิดโครงการได้อีก</span>
              </div>

              {/* Conditional warnings */}
              {(hasNoFile || isEarlyClose) && (
                <div className="rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 space-y-2">
                  {hasNoFile && (
                    <div className="flex items-start gap-2 text-sm text-amber-800">
                      <Paperclip className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>ยังไม่ได้เพิ่มหลักฐานการปิดโครงการ</span>
                    </div>
                  )}
                  {isEarlyClose && (
                    <div className="flex items-start gap-2 text-sm text-amber-800">
                      <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        ปิดโครงการก่อนเวลา
                        {endDate && (
                          <span className="font-semibold"> (กำหนดสิ้นสุด {toThaiDate(endDate)})</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => setShowFinalConfirm(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={() => { setShowFinalConfirm(false); handleCompleteProject(); }}
                  disabled={completing}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition"
                >
                  {completing ? "กำลังบันทึก..." : "ยืนยันปิดโครงการ"}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="relative group">
          <button
            onClick={() => canComplete && setShowDoneConfirm(true)}
            disabled={!canComplete}
            className="rounded-md flex justify-center items-center gap-2
              bg-emerald-600 px-4 py-2 text-sm font-medium text-white
              hover:bg-emerald-700 transition
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
          >
            <Flag className="h-4 w-4" />
            เสร็จสิ้นโครงการ
          </button>
          {!canComplete && (
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2
              whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white
              opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              กรุณากรอกยอดใช้จริงทุกรายการความคืบหน้าก่อน
            </div>
          )}
        </div>
        {budgetPlanId && (
          <div className="relative group">
            <div
              onClick={() => {
                onNavigationToProcess(budgetPlanId);
              }}
              className="rounded-md bg-gradient-to-r from-emerald-500 to-sky-500 p-2 cursor-pointer"
            >
              <ClipboardList className="h-5 w-5 text-white" />
            </div>

            <div
              className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
                whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white
                opacity-0 transition-opacity duration-200
                group-hover:opacity-100"
            >
              กดเพื่อดูสถานะการอนุมัติ
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === "pending_approval") {
    return (
      <div className="flex gap-1 ">
        <div
          className="rounded-md flex justify-center items-center gap-3
          bg-yellow-500 px-4  h-fit py-2 animate-pulse duration-1000 text-sm font-medium text-white cursor-wait"
        >
          <Clock className="h-5 w-5 animate-pulse" />
          กำลังรออนุมัติโครงการ...
        </div>
        {budgetPlanId && (
          <div className="relative group">
            <div
              onClick={() => {
                onNavigationToProcess(budgetPlanId);
              }}
              className="rounded-md bg-amber-500 p-2 cursor-pointer"
            >
              <ClipboardList className="h-5 w-5 text-white" />
            </div>

            <div
              className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
                whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white
                opacity-0 transition-opacity duration-200
                group-hover:opacity-100"
            >
              กดเพื่อดูสถานะการอนุมัติ
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === "in_revision") {
    return (
      <Link
        href={`/organizer/projects/approval/${projectId}`}
        className="rounded-md flex justify-center items-center gap-3
          bg-amber-500 px-4 py-2 text-sm font-medium text-white
          hover:bg-amber-600 transition"
      >
        <SquareArrowUp className="h-5 w-5" />
        ถูกส่งกลับแก้ไข — ยื่นอนุมัติใหม่
      </Link>
    );
  }

  if (status === "rejected") {
    return (
      <div
        className="rounded-md flex justify-center items-center gap-3
          bg-red-600 px-4 py-2 text-sm font-medium text-white cursor-default"
      >
        <XCircle className="h-5 w-5" />
        ถูกปฏิเสธ
      </div>
    );
  }

  if (status === "closed") {
    return (
      <div
        className="rounded-md flex justify-center items-center gap-3
          bg-slate-500 px-4 py-2 text-sm font-medium text-white cursor-default"
      >
        <CheckCircle className="h-5 w-5" />
        ปิดแผนงบประมาณแล้ว
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div
        className="rounded-md flex justify-center items-center gap-3
          bg-gray-400 px-4 py-2 text-sm font-medium text-white cursor-default"
      >
        <Ban className="h-5 w-5" />
        ยกเลิกแล้ว
      </div>
    );
  }
}

