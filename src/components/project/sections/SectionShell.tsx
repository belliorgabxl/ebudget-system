"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  isEditing: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: ReactNode;
};

export function SectionShell({
  title,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  children,
}: Props) {
  return (
    <section className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-200 px-5 py-1 rounded-sm ">
          <h2 className="text-base font-semibold text-white">{title}</h2>
        </div>
        

        {!isEditing ? (
          <button
            onClick={onEdit}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            แก้ไข
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-60"
            >
              ยกเลิก
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-60"
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        )}
      </div>

      {children}
    </section>
  );
}
