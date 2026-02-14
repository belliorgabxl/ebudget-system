"use client";

import React, { useEffect, useState } from "react";
import { X, Eye, EyeOff, RefreshCw } from "lucide-react";
import { CreateUserByAdminFromApi } from "@/api/users.client";
import { GetRolesByOrgIdFromApi } from "@/api/role.client";
import { GetOrganizationsFromApi } from "@/api/organization.client";
import type { CreateUserRequest } from "@/dto/userDto";
import type { RoleRespond } from "@/dto/roleDto";
import type { OrganizationResponse } from "@/dto/organizationDto";
import { useToast } from "@/components/ToastProvider";

type NewUser = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization_id: string;
  role_id: number;
};

type FieldKey =
  | "first_name"
  | "last_name"
  | "username"
  | "email"
  | "password"
  | "confirmPassword"
  | "organization_id"
  | "role_id";

type AddUserModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (u: any) => void;
  lockedOrgId?: string; // Optional: If provided, organization will be locked to this ID
};

export default function AddUserModal({
  open,
  onClose,
  onAdd,
  lockedOrgId,
}: AddUserModalProps) {
  const { push } = useToast();

  const initialForm: NewUser = {
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization_id: "",
    role_id: 0,
  };

  const [form, setForm] = useState<NewUser>(initialForm);

  const [roles, setRoles] = useState<RoleRespond[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<{
    username: string;
    password: string;
    organization_name: string;
  } | null>(null);

  // field-level errors
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldKey, string>>
  >({});

  // password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // load organizations when modal opens
  useEffect(() => {
    if (!open) return;

    // If lockedOrgId is provided, set it immediately
    if (lockedOrgId) {
      setForm(prev => ({ ...prev, organization_id: lockedOrgId }));
    }

    // Skip loading organizations if we have a locked org
    if (lockedOrgId) return;

    let mounted = true;
    (async () => {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const o = await GetOrganizationsFromApi({ limit: 1000 });
        if (!mounted) return;
        setOrganizations(o.items || []);
      } catch (err: any) {
        console.error("Failed to load organizations:", err);
        if (mounted)
          setOptionsError(
            err?.message ?? "ไม่สามารถโหลดองค์กรได้"
          );
        push(
          "error",
          "โหลดองค์กรไม่สำเร็จ",
          err?.message ?? "ไม่สามารถโหลดองค์กรได้"
        );
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lockedOrgId]);

  // Load organization name if lockedOrgId is provided
  useEffect(() => {
    if (!lockedOrgId || !open) return;

    let mounted = true;
    (async () => {
      try {
        const orgs = await GetOrganizationsFromApi({ limit: 1000 });
        if (!mounted) return;
        setOrganizations(orgs.items || []);
      } catch (err) {
        console.error("Failed to load locked organization:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [lockedOrgId, open]);

  // load roles when organization changes
  useEffect(() => {
    if (!form.organization_id) {
      setRoles([]);
      setForm(prev => ({ ...prev, role_id: 0 }));
      return;
    }

    let mounted = true;
    (async () => {
      setLoadingRoles(true);
      try {
        const r = await GetRolesByOrgIdFromApi(form.organization_id);
        if (!mounted) return;
        setRoles(r);
        // Reset role_id if current selection is not in new list
        if (form.role_id && !r.some(role => role.id === form.role_id)) {
          setForm(prev => ({ ...prev, role_id: 0 }));
        }
      } catch (err: any) {
        console.error("Failed to load roles:", err);
        if (mounted) setRoles([]);
      } finally {
        if (mounted) setLoadingRoles(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.organization_id]);

  // close handler that resets state then calls parent onClose
  const handleClose = () => {
    setForm(initialForm);
    setFieldErrors({});
    setOptionsError(null);
    setShowPassword(false);
    setShowConfirm(false);
    setRoles([]);
    onClose();
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setForm(prev => ({ ...prev, password, confirmPassword: password }));
    // Clear password errors
    setFieldErrors(prev => {
      const { password: _, confirmPassword: __, ...rest } = prev;
      return rest;
    });
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

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
      case "organization_id":
        if (!v) return "ต้องเลือกองค์กร";
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
      "organization_id",
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
      push(
        "error",
        "ข้อมูลไม่ครบ/ไม่ถูกต้อง",
        "กรุณาตรวจสอบช่องที่มีข้อความเตือน"
      );
      return;
    }

    const payload: CreateUserRequest = {
      department_id: null,
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      organization_id: form.organization_id,
      username: form.username,
      password: form.password,
      position: null,
      role_id: form.role_id as number,
    };

    console.debug("CreateUser (Admin) payload:", payload);

    setSubmitting(true);
    try {
      const res = await CreateUserByAdminFromApi(payload);
      
      console.log("[AddUserModal] API Response:", res);
      
      // Check if creation was successful
      if (!res || !res.ok) {
        const serverMsg =
          res?.message ||
          (res?.data && JSON.stringify(res.data)) ||
          "HTTP error";
        push("error", "สร้างผู้ใช้ไม่สำเร็จ", serverMsg);
        console.error("CreateUserByAdminFromApi failed:", res);
        return;
      }

      // Get organization name
      const selectedOrg = organizations.find(o => o.id === form.organization_id);
      
      console.log("[AddUserModal] Showing success modal");
      
      // Show success modal with credentials
      setCreatedUserData({
        username: form.username,
        password: form.password,
        organization_name: selectedOrg?.name || form.organization_id,
      });
      setShowSuccessModal(true);
      
      // Don't close main modal yet, wait for success modal to close
      onAdd(res.data ?? {});
    } catch (err: any) {
      console.error("CreateUser error:", err);
      const msg = err?.message ?? "เกิดข้อผิดพลาด";
      push("error", "สร้างผู้ใช้ไม่สำเร็จ", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Main Modal - Add User Form */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    เพิ่มผู้ใช้ใหม่
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    กรอกข้อมูลผู้ใช้ใหม่ในระบบ (Admin)
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingOptions && (
              <div className="text-sm text-gray-600">
                กำลังโหลดตัวเลือก...
              </div>
            )}
            {optionsError && (
              <div className="text-sm text-red-600">{optionsError}</div>
            )}

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                องค์กร <span className="text-red-500">*</span>
                {lockedOrgId && <span className="ml-2 text-xs text-blue-600">(ล็อกแล้ว)</span>}
              </label>
              <select
                value={form.organization_id}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    organization_id: e.target.value,
                  }))
                }
                onBlur={() => handleBlur("organization_id")}
                disabled={loadingOptions || !!lockedOrgId}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  fieldErrors.organization_id
                    ? "border-red-500"
                    : lockedOrgId 
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-300"
                } disabled:opacity-50`}
              >
                {!lockedOrgId && <option value="">-- เลือกองค์กร --</option>}
                {lockedOrgId ? (
                  <option value={lockedOrgId}>
                    {organizations.find(o => o.id === lockedOrgId)?.name || "กำลังโหลด..."}
                  </option>
                ) : (
                  organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))
                )}
              </select>
              {fieldErrors.organization_id && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.organization_id}
                </p>
              )}
              {!lockedOrgId && (
                <p className="text-xs text-gray-500 mt-1">
                  กรุณาเลือกองค์กรก่อนเพื่อโหลดบทบาทที่เกี่ยวข้อง
                </p>
              )}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  onBlur={() => handleBlur("first_name")}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    fieldErrors.first_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {fieldErrors.first_name && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  onBlur={() => handleBlur("last_name")}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    fieldErrors.last_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {fieldErrors.last_name && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อผู้ใช้ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                onBlur={() => handleBlur("username")}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  fieldErrors.username ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.username && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                onBlur={() => handleBlur("email")}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  fieldErrors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                บทบาท <span className="text-red-500">*</span>
              </label>
              <select
                value={form.role_id}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    role_id: Number(e.target.value),
                  }))
                }
                onBlur={() => handleBlur("role_id")}
                disabled={!form.organization_id || loadingRoles}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  fieldErrors.role_id ? "border-red-500" : "border-gray-300"
                } disabled:opacity-50`}
              >
                <option value={0}>
                  {loadingRoles ? "กำลังโหลดบทบาท..." : "-- เลือกบทบาท --"}
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.display_name || r.name}
                  </option>
                ))}
              </select>
              {fieldErrors.role_id && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.role_id}
                </p>
              )}
              {!form.organization_id && (
                <p className="text-xs text-gray-500 mt-1">
                  เลือกองค์กรก่อนเพื่อดูบทบาท
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    onBlur={() => handleBlur("password")}
                    className={`w-full px-3 py-2 border rounded-lg text-sm pr-10 ${
                      fieldErrors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  title="สุ่มรหัสผ่าน"
                  className="px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  สุ่ม
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.password}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  onBlur={() => handleBlur("confirmPassword")}
                  className={`w-full px-3 py-2 border rounded-lg text-sm pr-10 ${
                    fieldErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || loadingOptions}
              className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {submitting ? "กำลังสร้าง..." : "สร้างผู้ใช้"}
            </button>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && createdUserData && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowSuccessModal(false);
              setCreatedUserData(null);
              handleClose();
            }}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              {/* Success Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      สร้างผู้ใช้สำเร็จ
                    </h3>
                    <p className="text-sm text-gray-500">
                      กรุณาบันทึกข้อมูลเข้าสู่ระบบ
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Body */}
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <svg
                      className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800">
                        โปรดคัดลอกข้อมูลนี้ไว้
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        คุณจะไม่สามารถเห็นรหัสผ่านได้อีกครั้ง
                        นอกจากจะทำการรีเซ็ตรหัสผ่าน
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      องค์กร
                    </label>
                    <p className="text-sm font-medium text-gray-900">
                      {createdUserData.organization_name}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      ชื่อผู้ใช้
                    </label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 font-mono">
                        {createdUserData.username}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdUserData.username);
                          push("success", "คัดลอกชื่อผู้ใช้แล้ว");
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        คัดลอก
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      รหัสผ่าน
                    </label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 font-mono">
                        {createdUserData.password}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdUserData.password);
                          push("success", "คัดลอกรหัสผ่านแล้ว");
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        คัดลอก
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setCreatedUserData(null);
                    handleClose();
                  }}
                  className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
