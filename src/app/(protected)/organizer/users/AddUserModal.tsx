"use client";

import React, { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { CreateUserFromApi } from "@/api/users.client";
import { GetRoleFromApi } from "@/api/role.client";
import { fetchDepartments } from "@/api/department";
import type { CreateUserRequest } from "@/dto/userDto";
import type { RoleRespond } from "@/dto/roleDto";
import type { Department } from "@/dto/departmentDto";
import { useToast } from "@/components/ToastProvider";

type NewUser = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  position: string;
  department_id?: string;
  role_id: number;
  status: string;
};

type FieldKey =
  | "first_name"
  | "last_name"
  | "username"
  | "email"
  | "password"
  | "confirmPassword"
  | "position"
  | "department_id"
  | "role_id";

type AddUserModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (u: any) => void;
};

export default function AddUserModal({ open, onClose, onAdd }: AddUserModalProps) {
  const { push } = useToast();

  const initialForm: NewUser = {
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    position: "",
    department_id: "",
    role_id: 0,
    status: "Active",
  };

  const [form, setForm] = useState<NewUser>(initialForm);

  const [roles, setRoles] = useState<RoleRespond[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // field-level errors
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});

  // password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // load roles & departments when modal opens
  useEffect(() => {
    if (!open) return;

    let mounted = true;
    (async () => {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const [r, d] = await Promise.all([GetRoleFromApi(), fetchDepartments()]);
        if (!mounted) return;
        setRoles(r);
        setDepartments(d);

        // keep placeholders as default (no auto-select)
      } catch (err: any) {
        console.error("Failed to load roles/departments:", err);
        if (mounted) setOptionsError(err?.message ?? "ไม่สามารถโหลดตัวเลือกได้");
        push("error", "โหลดตัวเลือกไม่สำเร็จ", err?.message ?? "ไม่สามารถโหลดตัวเลือกได้");
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // close handler that resets state then calls parent onClose
  const handleClose = () => {
    setForm(initialForm);
    setFieldErrors({});
    setOptionsError(null);
    setShowPassword(false);
    setShowConfirm(false);
    onClose();
  };

  // close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateField = (key: FieldKey, value?: any): string | null => {
    const v = value ?? (form as any)[key];
    switch (key) {
      case "first_name":
        if (!v?.trim()) return "ต้องระบุชื่อ";
        return null;
      case "last_name":
        if (!v?.trim()) return "ต้องระบุนามสกุล";
        return null;
      case "username":
        if (!v?.trim()) return "ต้องระบุชื่อผู้ใช้";
        return null;
      case "email":
        if (!v?.trim()) return "ต้องระบุอีเมล";
        if (!isValidEmail(v)) return "รูปแบบอีเมลไม่ถูกต้อง";
        return null;
      case "password":
        if (!v) return "ต้องระบุรหัสผ่าน";
        if (v.length < 8) return "ต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
        return null;
      case "confirmPassword":
        if (!v) return "ต้องระบุรหัสผ่านยืนยัน";
        if (v !== form.password) return "รหัสผ่านไม่ตรงกัน";
        return null;
      case "position":
        if (!v?.trim()) return "ต้องระบุตำแหน่ง";
        return null;
      case "department_id":
        if (!v) return "ต้องเลือกแผนก";
        return null;
      case "role_id":
        if (!v || Number(v) === 0) return "ต้องเลือกบทบาท";
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (key: FieldKey) => {
    const msg = validateField(key);
    setFieldErrors((prev) => ({ ...prev, [key]: msg ?? undefined }));
  };

  const validateAll = (): boolean => {
    const keys: FieldKey[] = [
      "first_name",
      "last_name",
      "username",
      "email",
      "password",
      "confirmPassword",
      "position",
      "department_id",
      "role_id",
    ];
    const newErrors: Partial<Record<FieldKey, string>> = {};
    for (const k of keys) {
      const m = validateField(k);
      if (m) newErrors[k] = m;
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const ok = validateAll();
    if (!ok) {
      push("error", "ข้อมูลไม่ครบ/ไม่ถูกต้อง", "กรุณาตรวจสอบช่องที่มีข้อความเตือน");
      return;
    }

    const payload: CreateUserRequest = {
      department_id: form.department_id || "",
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      username: form.username,
      password: form.password,
      position: form.position,
      role_id: (form.role_id as unknown) as number,
    };

    console.debug("CreateUser payload:", payload);

    setSubmitting(true);
    try {
      const res = await CreateUserFromApi(payload);
      const okRes = (res && typeof res === "object" && "ok" in res) ? res.ok : Boolean(res);

      if (!okRes) {
        const serverMsg =
          (res && typeof res === "object" && (res.message || JSON.stringify((res as any).data || res))) ||
          `HTTP error`;
        push("error", "สร้างผู้ใช้ไม่สำเร็จ", serverMsg);
        console.error("CreateUserFromApi failed:", res);
        return;
      }

      const createdData = (res && typeof res === "object" && (res.data || (res as any).data)) ?? null;

      const created = createdData
        ? {
          id: createdData.id ?? `EMP-${Math.floor(Math.random() * 100000)}`,
          name: `${createdData.first_name ?? payload.first_name} ${createdData.last_name ?? payload.last_name}`.trim(),
          title: createdData.position ?? payload.position,
          department:
            createdData.department_name ??
            (departments.find((d) => d.id === payload.department_id)?.name) ??
            payload.department_id ??
            "-",
          role:
            createdData.role_name ??
            (roles.find((r) => r.id === form.role_id)?.display_name ??
              roles.find((r) => r.id === form.role_id)?.name) ??
            form.role_id,
          status: form.status === "Active" ? "Active" : "On leave",
          isActive: form.status === "Active",
          createdAt: createdData.created_at ?? new Date().toISOString().slice(0, 10),
        }
        : {
          id: `EMP-${Math.floor(Math.random() * 100000)}`,
          name: `${payload.first_name} ${payload.last_name}`.trim(),
          title: payload.position,
          department: (departments.find((d) => d.id === payload.department_id)?.name) ?? payload.department_id ?? "-",
          role:
            (roles.find((r) => r.id === form.role_id)?.display_name ??
              roles.find((r) => r.id === form.role_id)?.name) ??
            form.role_id,
          status: form.status === "Active" ? "Active" : "On leave",
          isActive: form.status === "Active",
          createdAt: new Date().toISOString().slice(0, 10),
        };

      onAdd(created);
      push("success", "สร้างผู้ใช้สำเร็จ", `${created.name} ถูกสร้างเรียบร้อยแล้ว`);

      // reset states and close
      setFieldErrors({});
      setForm(initialForm);
      onClose();
    } catch (err: any) {
      console.error("Unhandled create-user error", err);
      const msg = err?.message ?? "เกิดข้อผิดพลาดไม่คาดคิด";
      push("error", "เกิดข้อผิดพลาด", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // helper for input classes
  const inputClass = (k: FieldKey) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 ${fieldErrors[k] ? "border-rose-500 focus:ring-rose-100" : "border-slate-300"
    }`;

  // overlay click handler — only close if clicked on the overlay itself
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl"
        // stop propagation so clicks inside modal don't bubble to overlay
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">เพิ่มผู้ใช้งานใหม่</h3>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {optionsError && <div className="text-sm text-red-600">โหลดตัวเลือกผิดพลาด: {optionsError}</div>}

          <div className="grid grid-cols-2 gap-4">
            {/* first_name */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                <span>ชื่อจริง</span>
                {fieldErrors.first_name ? <span className="text-rose-600 text-xs ml-2">{fieldErrors.first_name}</span> : null}
              </label>
              <input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                onBlur={() => handleBlur("first_name")}
                placeholder="เช่น Somchai"
                className={inputClass("first_name")}
                autoComplete="given-name"
                aria-invalid={!!fieldErrors.first_name}
              />
            </div>

            {/* last_name */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                <span>นามสกุล</span>
                {fieldErrors.last_name ? <span className="text-rose-600 text-xs ml-2">{fieldErrors.last_name}</span> : null}
              </label>
              <input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                onBlur={() => handleBlur("last_name")}
                placeholder="เช่น Khamsuk"
                className={inputClass("last_name")}
                autoComplete="family-name"
                aria-invalid={!!fieldErrors.last_name}
              />
            </div>

            {/* username */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                <span>ชื่อผู้ใช้</span>
                {fieldErrors.username ? <span className="text-rose-600 text-xs ml-2">{fieldErrors.username}</span> : null}
              </label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onBlur={() => handleBlur("username")}
                placeholder="เช่น somchai.k"
                className={inputClass("username")}
                autoComplete="username"
                aria-invalid={!!fieldErrors.username}
              />
            </div>

            {/* email */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                <span>อีเมล</span>
                {fieldErrors.email ? <span className="text-rose-600 text-xs ml-2">{fieldErrors.email}</span> : null}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => handleBlur("email")}
                placeholder="example@domain.com"
                className={inputClass("email")}
                autoComplete="off"
                aria-invalid={!!fieldErrors.email}
              />
            </div>

            {/* Password field (flex wrapper, no absolute) */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                <span>รหัสผ่าน</span>
                {fieldErrors.password ? <span className="text-rose-600 text-xs ml-2">{fieldErrors.password}</span> : null}
              </label>

              {/* wrapper แทน input border */}
              <div
                className={`flex items-center h-10 rounded-lg px-3 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500
      ${fieldErrors.password ? "border-rose-500" : "border-slate-300"} border`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onBlur={() => handleBlur("password")}
                  placeholder="รหัสผ่านอย่างน้อย 8 ตัว"
                  className="flex-1 bg-transparent text-sm outline-none"
                  autoComplete="off"
                  aria-invalid={!!fieldErrors.password}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="ml-2 p-1 h-8 w-8 flex items-center justify-center text-slate-500 rounded"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password field (same pattern) */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                <span>ยืนยันรหัสผ่าน</span>
                {fieldErrors.confirmPassword ? <span className="text-rose-600 text-xs ml-2">{fieldErrors.confirmPassword}</span> : null}
              </label>

              <div
                className={`flex items-center h-10 rounded-lg px-3 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500
      ${fieldErrors.confirmPassword ? "border-rose-500" : "border-slate-300"} border`}
              >
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  onBlur={() => handleBlur("confirmPassword")}
                  placeholder="ยืนยันรหัสผ่าน"
                  className="flex-1 bg-transparent text-sm outline-none"
                  autoComplete="off"
                  aria-invalid={!!fieldErrors.confirmPassword}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="ml-2 p-1 h-8 w-8 flex items-center justify-center text-slate-500 rounded"
                  aria-label={showConfirm ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>






            {/* position */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                <span>ตำแหน่ง</span>
                {fieldErrors.position ? <span className="text-rose-600 text-xs ml-2">{fieldErrors.position}</span> : null}
              </label>
              <input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                onBlur={() => handleBlur("position")}
                placeholder="เช่น HR Manager"
                className={inputClass("position")}
                autoComplete="organization-title"
                aria-invalid={!!fieldErrors.position}
              />
            </div>

            {/* department_id */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
                <span>แผนก</span>
                {fieldErrors.department_id ? <span className="text-rose-600 text-xs ml-2">{fieldErrors.department_id}</span> : null}
              </label>
              <select
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                onBlur={() => handleBlur("department_id")}
                className={inputClass("department_id")}
                disabled={loadingOptions}
                aria-invalid={!!fieldErrors.department_id}
              >
                <option value="">-- เลือกแผนก --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* role full width */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1.5">
              <span>บทบาท (role)</span>
              {fieldErrors.role_id ? <span className="text-rose-600 text-xs ml-2">{fieldErrors.role_id}</span> : null}
            </label>
            <select
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
              onBlur={() => handleBlur("role_id")}
              className={inputClass("role_id")}
              disabled={loadingOptions}
              aria-invalid={!!fieldErrors.role_id}
            >
              <option value={0}>-- เลือกบทบาท --</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.display_name ?? r.name}
                </option>
              ))}
            </select>
            {loadingOptions && <div className="mt-1 text-xs text-slate-400">กำลังโหลดตัวเลือก...</div>}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "กำลังสร้าง..." : "เพิ่มผู้ใช้"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
