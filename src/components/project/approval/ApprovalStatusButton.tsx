"use client";

import Link from "next/link";
import { SquareArrowUp, Clock, XCircle, Flag } from "lucide-react";
import { ClipboardClockIcon } from "@/components/icons/ClipboardClockIcon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProcessStep } from "../details/ProgressDetail";

interface ApprovalStatusButtonProps {
  projectId: string;
  budgetPlanId?: string;
  status: string;
  processSteps?: ProcessStep[];
  progressList?: { budget_cost_used?: number | string | null }[];
}

export default function ApprovalStatusButton({
  projectId,
  budgetPlanId,
  status,
  processSteps,
  progressList,
}: ApprovalStatusButtonProps) {
  const router = useRouter();
  const [showDoneConfirm, setShowDoneConfirm] = useState(false);
  const [completing, setCompleting] = useState(false);

  const canComplete =
    !progressList ||
    progressList.length === 0 ||
    progressList.every(
      (p) => p.budget_cost_used !== null && p.budget_cost_used !== undefined && p.budget_cost_used !== ""
    );

  const onNavigationToProcess = (budgetPlanId: string) => {
    router.push(`/organizer/approve/process/${budgetPlanId}`);
  };

  const handleCompleteProject = async () => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/complete`, { method: "PATCH" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently handle; status update is best-effort
    } finally {
      setCompleting(false);
      setShowDoneConfirm(false);
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
    return (
      <div className="flex gap-1 flex-wrap items-center">
        {/* Done confirm dialog */}
        {showDoneConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">เสร็จสิ้นโครงการ</h2>
              <p className="text-sm text-gray-600">
                คุณต้องการยืนยันว่าโครงการนี้เสร็จสิ้นแล้วใช่หรือไม่?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDoneConfirm(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCompleteProject}
                  disabled={completing}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
                >
                  ยืนยัน
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
              <ClipboardClockIcon className="h-5 w-5 text-white" />
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
              <ClipboardClockIcon className="h-5 w-5 text-white" />
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
      <div
        className="rounded-md flex justify-center items-center gap-3
          bg-red-600 px-4 py-2 text-sm font-medium text-white cursor-default"
      >
        <XCircle className="h-5 w-5" />
        โครงการถูกปฏิเสธ
      </div>
    );
  }

  return null;
}
