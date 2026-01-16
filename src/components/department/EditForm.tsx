"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Department } from "@/dto/projectDto";

const USE_MOCK_API = true;

type FormState = {
  code: string;
  name: string;
  head: string;
  employees: string;
  projectsCount: string;
};

type ApiResult<T = any> =
  | { ok: true; data: T }
  | { ok: false; message: string };

async function updateDepartment(
  id: string,
  payload: Partial<Department>
): Promise<ApiResult> {
  if (USE_MOCK_API) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, data: { id, ...payload } };
  }

  try {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/departments/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );
    if (!resp.ok) return { ok: false, message: `Save failed (${resp.status})` };
    const data = await resp.json();
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Save error" };
  }
}

export function DepartmentEditForm({ initial }: { initial: Department }) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>({
    code: initial.code ?? "",
    name: initial.name ?? "",
    head: initial.head ?? "",
    employees: initial.employees != null ? String(initial.employees) : "",
    projectsCount:
      initial.projectsCount != null ? String(initial.projectsCount) : "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  //   const emailLike = false
  const codeValid = form.code.trim().length > 0;
  const nameValid = form.name.trim().length > 0;
  const employeesValid = form.employees === "" || /^\d+$/.test(form.employees);
  const projectsValid =
    form.projectsCount === "" || /^\d+$/.test(form.projectsCount);

  const canSubmit = codeValid && nameValid && employeesValid && projectsValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Department> = {
        code: form.code.trim(),
        name: form.name.trim(),
        head: form.head.trim() || undefined,
        employees:
          form.employees.trim() === ""
            ? undefined
            : Number.parseInt(form.employees.trim(), 10),
        projectsCount:
          form.projectsCount.trim() === ""
            ? undefined
            : Number.parseInt(form.projectsCount.trim(), 10),
      };

      const res = await updateDepartment(initial.id, payload);
      if (!res.ok) throw new Error(res.message);

      router.push(`/user/department/${initial.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      code: initial.code ?? "",
      name: initial.name ?? "",
      head: initial.head ?? "",
      employees: initial.employees != null ? String(initial.employees) : "",
      projectsCount:
        initial.projectsCount != null ? String(initial.projectsCount) : "",
    });
    setError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="รหัสหน่วยงาน"
          required
          invalid={!codeValid && form.code !== ""}
        >
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={onChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 ${
              codeValid
                ? "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                : "border-red-400 focus:border-red-500 focus:ring-red-500"
            }`}
            placeholder="เช่น ADM / DEV / FIN"
          />
        </Field>

        <Field
          label="ชื่อหน่วยงาน"
          required
          invalid={!nameValid && form.name !== ""}
        >
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 ${
              nameValid
                ? "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                : "border-red-400 focus:border-red-500 focus:ring-red-500"
            }`}
            placeholder="เช่น ฝ่ายพัฒนาซอฟต์แวร์"
          />
        </Field>

        <Field label="หัวหน้าหน่วยงาน (ไม่บังคับ)">
          <input
            type="text"
            name="head"
            value={form.head}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="ชื่อ-นามสกุล"
          />
        </Field>

        <Field
          label="จำนวนพนักงาน (ตัวเลข)"
          invalid={!employeesValid && form.employees !== ""}
        >
          <input
            type="text"
            name="employees"
            inputMode="numeric"
            value={form.employees}
            onChange={onChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 ${
              employeesValid
                ? "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                : "border-red-400 focus:border-red-500 focus:ring-red-500"
            }`}
            placeholder="เช่น 12"
          />
        </Field>

        <Field
          label="จำนวนโครงการ (ตัวเลข)"
          invalid={!projectsValid && form.projectsCount !== ""}
        >
          <input
            type="text"
            name="projectsCount"
            inputMode="numeric"
            value={form.projectsCount}
            onChange={onChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 ${
              projectsValid
                ? "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                : "border-red-400 focus:border-red-500 focus:ring-red-500"
            }`}
            placeholder="เช่น 5"
          />
        </Field>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          รีเซ็ตค่าเริ่มต้น
        </button>
        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  invalid,
  children,
}: React.PropsWithChildren<{
  label: string;
  required?: boolean;
  invalid?: boolean;
}>) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      <div>{children}</div>
      {invalid && <div className="text-xs text-red-600">รูปแบบไม่ถูกต้อง</div>}
    </label>
  );
}
