"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RejectConfirmPopup from "../popup/RejectConfirmPopup";
import ReturnProjectPopup from "../popup/ReturnProjectPopup";

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
  const handleReturnConfirm = async (reason?: string) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 1000));
      setOpenReturn(false);
      router.back();
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
      await new Promise((r) => setTimeout(r, 1000));
      setOpenReject(false);
      router.back();
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
          //   onClick={onApprove}
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
    </div>
  );
}
