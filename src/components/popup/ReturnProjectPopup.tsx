"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  loading?: boolean;
  requireReason?: boolean; 
  onCancel: () => void;
  onConfirm: (reason?: string) => void;
};

export default function ReturnProjectPopup({
  open,
  loading = false,
  requireReason = true,
  onCancel,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const canSubmit =
    !requireReason || (reason.trim().length > 0 && !loading);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          ส่งกลับโครงการ
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          โครงการจะถูกส่งกลับให้ผู้เสนอแก้ไขก่อนส่งใหม่
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring"
          placeholder="ระบุเหตุผลที่ต้องแก้ไข (ถ้ามี)"
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onConfirm(reason.trim() || undefined)}
            className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading ? "กำลังส่ง..." : "ยืนยันส่งกลับ"}
          </button>
        </div>
      </div>
    </div>
  );
}
