"use client";

type Props = {
  open: boolean;
  loading?: boolean;

  title?: string;
  description?: string;
  warning?: string;

  confirmLabel?: string;
  cancelLabel?: string;

  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmSubmitPopup({
  open,
  loading = false,

  title = "ยืนยันการทำรายการ",
  description,
  warning,

  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",

  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

        {description ? (
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
            {description}
          </p>
        ) : null}
        {warning ? (
          <p className="mt-2 text-xs text-red-600 whitespace-pre-line">
            {warning}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "กำลังดำเนินการ..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
