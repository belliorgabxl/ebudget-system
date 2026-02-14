"use client";

import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { CreateDepartmentFromApi } from "@/api/department.client";

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
  const { push } = useToast();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>("");

  useEffect(() => {
    // Fetch current user to get organization_id
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        console.log("auth/me response status:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("auth/me response data:", data);
          if (data && data.organization_id) {
            console.log("Setting organizationId to:", data.organization_id);
            setOrganizationId(data.organization_id);
            console.log("Organization ID set successfully: " + data.organization_id);
          } else {
            console.log("No organization_id found in response");
          }
        } else {
          console.log("auth/me request failed");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting form with data:", { ...form, organization_id: organizationId });

    try {
      if (!organizationId) {
        throw new Error("ไม่พบข้อมูลองค์กร");
      }

      const result = await CreateDepartmentFromApi({
        code: form.code,
        name: form.name,
        organization_id: organizationId,
      });

      if (result.success) {
        push('success', 'สร้างหน่วยงานสำเร็จ');
        onSuccess?.();
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      push('error', error.message || 'เกิดข้อผิดพลาด');
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
