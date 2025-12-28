"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RejectConfirmPopup from "../popup/RejectConfirmPopup";
import ReturnProjectPopup from "../popup/ReturnProjectPopup";
import { processApprovalAction } from "@/api/approval.client";
import ConfirmSubmitPopup from "../popup/ConfirmPopup";
import { toast } from "react-toastify";

type Props = {
  projectId: string;
  projectName: string;
};

export default function ApproveProjectClient({
  projectId,
  projectName,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openReturn, setOpenReturn] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);

  const handleApproveConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await processApprovalAction({
        action: "approve",
        budget_plan_id: projectId,
        comments: "อนุมัติโครงการ",
      });

      setOpenApprove(false);
      toast.success("อนุมัติสำเร็จ")
      router.push("/success-screen")
    } catch (e: any) {
      setError(e?.message ?? "ไม่สามารถอนุมัติโครงการได้");
      toast.error("อนุมัติไม่สำเร็จ")
      router.push("/failed-screen")
    } finally {
      setLoading(false);
    }
  };
  const handleReturnConfirm = async (reason?: string) => {
    setLoading(true);
    setError(null);

    try {
      await processApprovalAction({
        action: "request_revision",
        budget_plan_id: projectId,
        comments: reason?.trim() || "ขอให้แก้ไขเพิ่มเติม",
      });

      setOpenReturn(false);
      router.back();
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "ไม่สามารถส่งกลับโปรเจ็คได้");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    setLoading(true);
    setError(null);

    try {
      await processApprovalAction({
        action: "reject",
        budget_plan_id: projectId,
        rejection_reason: reason?.trim() || "ไม่อนุมัติ",
        comments: reason?.trim(),
      });

      setOpenReject(false);
      router.back();
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "ไม่สามารถทำรายการได้");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => history.back()}
          disabled={loading}
          className="rounded-lg  bg-gray-200 hover:bg-gray-400 hover:text-white px-4 py-2 text-sm font-medium
           text-slate-700  disabled:opacity-60"
        >
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={() => setOpenReject(true)}
          disabled={loading}
          className="rounded-lg border border-red-500 bg-red-100 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-60"
        >
          ไม่อนุมัติ
        </button>

        <button
          type="button"
          onClick={() => setOpenReturn(true)}
          disabled={loading}
          className="rounded-lg border border-yellow-500 bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-500 hover:bg-yellow-500 hover:text-white disabled:opacity-60"
        >
          ส่งกลับโปรเจ็ค
        </button>
        <button
          type="button"
          onClick={() => setOpenApprove(true)}
          disabled={loading}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading ? "กำลังอนุมัติ..." : "อนุมัติ"}
        </button>
      </div>
      <ReturnProjectPopup
        open={openReturn}
        loading={loading}
        requireReason={true}
        onCancel={() => setOpenReturn(false)}
        onConfirm={handleReturnConfirm}
      />
      <RejectConfirmPopup
        open={openReject}
        loading={loading}
        onCancel={() => setOpenReject(false)}
        onConfirm={handleRejectConfirm}
      />
      <ConfirmSubmitPopup
        open={openApprove}
        loading={loading}
        title="ยืนยันการอนุมัติโครงการ"
        description={`คุณต้องการอนุมัติโครงการ "${projectName}" ใช่หรือไม่`}
        warning="* เมื่ออนุมัติแล้ว จะไม่สามารถแก้ไขข้อมูลได้"
        confirmLabel="ยืนยันอนุมัติ"
        cancelLabel="ยกเลิก"
        onCancel={() => setOpenApprove(false)}
        onConfirm={handleApproveConfirm}
      />
    </div>
  );
}
