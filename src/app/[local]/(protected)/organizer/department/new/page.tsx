"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, X } from "lucide-react";

const initialForm = {
  code: "",
  name: "",
};

export default function CreateDepartmentPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Call API to create department
      await new Promise((r) => setTimeout(r, 1000));
      console.log("Create Department:", form);
      alert("สร้างหน่วยงานสำเร็จ");
      router.push("/organizer/department");
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">สร้างหน่วยงานใหม่</h1>
        <p className="text-sm text-gray-600">กรอกข้อมูลหน่วยงานที่ต้องการเพิ่ม</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
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
              placeholder="เช่น HR, FIN"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
              placeholder="เช่น ฝ่ายบุคคล"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
