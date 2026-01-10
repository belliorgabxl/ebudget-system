"use client";

import CreateDepartmentForm from "@/components/department/CreateDepartmentForm";

export default function CreateDepartmentModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-1 text-lg font-semibold">สร้างหน่วยงานใหม่</h2>
        <p className="mb-4 text-sm text-gray-600">
          กรอกข้อมูลหน่วยงานที่ต้องการเพิ่ม
        </p>

        <CreateDepartmentForm
          onCancel={onClose}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
