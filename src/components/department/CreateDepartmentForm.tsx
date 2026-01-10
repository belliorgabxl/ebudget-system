"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";

const initialForm = {
  code: "",
  name: "",
};

export default function CreateDepartmentForm({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: call API
      await new Promise((r) => setTimeout(r, 1000));
      alert("สร้างหน่วยงานสำเร็จ");
      onSuccess?.();
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          รหัสหน่วยงาน <span className="text-red-500">*</span>
        </label>
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          ชื่อหน่วยงาน <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 rounded-md border px-4 py-2 text-sm"
        >
          <X className="h-4 w-4" />
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </form>
  );
}
