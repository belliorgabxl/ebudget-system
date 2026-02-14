"use client";

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { GetUserRespond } from "@/dto/userDto";
import { GetRoleFromApi } from "@/api/role.client";
import { fetchDepartments } from "@/api/department";
import { UpdateUserFromApi } from "@/api/users.client";
import { useToast } from "@/components/ToastProvider";
import type { RoleRespond } from "@/dto/roleDto";
import type { Department } from "@/dto/departmentDto";

type Props = {
  open: boolean;
  user?: GetUserRespond | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave?: (data: Partial<GetUserRespond> & { role_id?: number }) => Promise<boolean> | boolean;
  statusLabel?: (u: any | null) => string;
};

const FIELD_LABELS: Record<string, string> = {
  id: "รหัส",
  first_name: "ชื่อจริง",
  last_name: "นามสกุล",
  email: "อีเมล",
  position: "ตำแหน่ง",
  department_name: "แผนก",
  role: "สิทธิ์ในระบบ",
  username: "ชื่อผู้ใช้",
};

export default function UserDetailsModal({ open, user, loading, error, onClose, onSave, statusLabel }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<GetUserRespond> | null>(null);
  const [saving, setSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [localUser, setLocalUser] = useState<GetUserRespond | null>(null);
  const [roles, setRoles] = useState<RoleRespond[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);
  const { push } = useToast();

  const makeEditable = (u?: GetUserRespond | null): Partial<GetUserRespond> | null => {
    if (!u) return null;
    const copy: any = { ...u };
    Object.keys(copy).forEach((k) => {
      if (copy[k] === null || copy[k] === undefined) copy[k] = "";
    });
    copy.department_id = (copy.department_id ?? copy.department_name ?? copy.department) ?? "";
    copy.role = (copy.role ?? "") as string;
    return copy;
  };

  useEffect(() => {
    if (user) setLocalUser(user);
    else setLocalUser(null);
  }, [user, open]);

  useEffect(() => {
    if (user && open) {
      setEditData({ ...user });
      setIsEditing(false);
      setSelectedRoleId(0);
    } else {
      setEditData(null);
      setIsEditing(false);
      setSelectedRoleId(0);
    }
  }, [user, open]);

  useEffect(() => {
    let mounted = true;
    const loadOptions = async () => {
      if (!isEditing) return;
      if (roles.length > 0 && departments.length > 0) {
        const currentRoleStr = (user as any)?.role ?? (user as any)?.role_name ?? "";
        let resolved = 0;
        if (currentRoleStr) {
          const asNum = Number(currentRoleStr);
          if (Number.isFinite(asNum) && asNum !== 0) {
            const foundById = roles.find((rr) => rr.id === asNum);
            if (foundById) resolved = foundById.id;
          }
          if (!resolved) {
            const foundByName = roles.find((rr) => rr.name === currentRoleStr || rr.display_name === currentRoleStr);
            if (foundByName) resolved = foundByName.id;
          }
        }
        setSelectedRoleId(resolved);

        setEditData((prev) => {
          const base = prev ? { ...prev } : makeEditable(user) || {};
          if (!base.role) base.role = currentRoleStr ?? "";
          if (!base.department_id) {
            const userDeptName = (user as any)?.department_name ?? (user as any)?.department;
            const found = departments.find((dd) => dd.name === userDeptName || dd.code === userDeptName);
            base.department_id = found ? found.id : base.department_id ?? "";
          }
          return base;
        });

        return;
      }

      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const [r, d] = await Promise.all([GetRoleFromApi(), fetchDepartments()]);
        if (!mounted) return;
        const roleList = r ?? [];
        const deptList = d ?? [];
        setRoles(roleList);
        setDepartments(deptList);

        const currentRoleStr = (user as any)?.role ?? (user as any)?.role_name ?? "";
        let resolved = 0;
        if (currentRoleStr) {
          const asNum = Number(currentRoleStr);
          if (Number.isFinite(asNum) && asNum !== 0) {
            const foundById = roleList.find((rr) => rr.id === asNum);
            if (foundById) resolved = foundById.id;
          }
          if (!resolved) {
            const foundByName = roleList.find((rr) => rr.name === currentRoleStr || rr.display_name === currentRoleStr);
            if (foundByName) resolved = foundByName.id;
          }
        }
        setSelectedRoleId(resolved);

        setEditData((prev) => {
          const base = prev ? { ...prev } : makeEditable(user) || {};
          if (!base.role) base.role = currentRoleStr ?? "";
          if (!base.department_id) {
            const userDeptId = (user as any)?.department_id;
            const userDeptName = (user as any)?.department_name ?? (user as any)?.department;
            if (userDeptId) base.department_id = userDeptId;
            else if (userDeptName) {
              const found = deptList.find((dd) => dd.name === userDeptName || dd.code === userDeptName);
              base.department_id = found ? found.id : "";
            }
          }
          return base;
        });
      } catch (err: any) {
        console.error("Failed to load roles/departments:", err);
        if (mounted) setOptionsError(err?.message ?? "ไม่สามารถโหลดตัวเลือกได้");
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    };

    loadOptions();
    return () => {
      mounted = false;
    };
  }, [isEditing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setEditData(user ? { ...user } : null);
      onClose();
    }
  };

  const handleEditChange = (key: string, value: any) => {
    if (!editData) return;
    setEditData({ ...editData, [key]: value });
  };

  const handleSave = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const payload: any = {
        user_id: (editData as any).id ?? (user as any)?.id ?? "",
        email: (editData as any).email ?? "",
        first_name: (editData as any).first_name ?? "",
        lastname: (editData as any).last_name ?? (editData as any).lastname ?? "",
        position: (editData as any).position ?? "",
        role_id: selectedRoleId ?? 0,
        department_id: String((editData as any).department_id ?? ""),
      };

      if ((!payload.role_id || payload.role_id === 0) && (editData as any).role) {
        const maybe = roles.find((rr) => rr.name === (editData as any).role || rr.display_name === (editData as any).role || String(rr.id) === (editData as any).role);
        if (maybe) payload.role_id = maybe.id;
      }

      const ok = await UpdateUserFromApi(payload);
      if (ok) {
        const updatedUser: GetUserRespond = {
          ...(localUser ?? (user as GetUserRespond) ?? ({} as GetUserRespond)),
          id: payload.user_id,
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.lastname,
          position: payload.position,
          department_id: payload.department_id,
          department_name: departments.find((d) => d.id === payload.department_id)?.name ?? (localUser ?? user)?.department_name,
          role: (editData as any).role ?? (localUser ?? user)?.role,
        } as GetUserRespond;

        setLocalUser(updatedUser);
        setIsEditing(false);
        setSelectedRoleId(0);
        setEditData(makeEditable(updatedUser));

        try {
          if (onSave) await onSave({ ...(editData ?? {}), role_id: payload.role_id });
        } catch (e) {
          console.warn("onSave handler threw", e);
        }

        try {
          push("success", "บันทึกสำเร็จ", "ข้อมูลผู้ใช้ถูกบันทึกแล้ว");
        } catch {}
      } else {
        try {
          push("error", "บันทึกไม่สำเร็จ", "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
        } catch {}
      }
    } catch (err) {
      console.error("save failed", err);
      try {
        push("error", "บันทึกไม่สำเร็จ", "เกิดข้อผิดพลาด");
      } catch {}
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 ${
      hasError ? "border-rose-500 focus:ring-rose-100" : "border-slate-300"
    }`;

  if (!open) return null;

  const displayedUser = localUser ?? user ?? null;

  const getDisplayRole = (u?: Partial<GetUserRespond> | null) => {
    if (!u) return "-";
    return (u as any).role_name ?? (u as any).role ?? "-";
  };

  const getDisplayDepartment = (u?: Partial<GetUserRespond> | null) => {
    if (!u) return "-";
    return (u as any).department_name ?? (u as any).department ?? (u as any).department_id ?? "-";
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">รายละเอียดผู้ใช้</h3>
          <button
            onClick={() => {
              setEditData(displayedUser ? { ...displayedUser } : null);
              onClose();
            }}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center text-gray-600">กำลังโหลดข้อมูลผู้ใช้...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : !displayedUser ? (
            <div className="text-center text-gray-600">ไม่พบข้อมูลผู้ใช้</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{FIELD_LABELS.username}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={(editData as any)?.username ?? ""}
                      onChange={(e) => handleEditChange("username", e.target.value)}
                      className={inputClass(false)}
                    />
                  ) : (
                    <div className="w-full rounded-lg border px-3 py-2 text-sm border-slate-100 bg-slate-50">{displayedUser.username ?? "-"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{FIELD_LABELS.email}</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={(editData as any)?.email ?? ""}
                      onChange={(e) => handleEditChange("email", e.target.value)}
                      className={inputClass(false)}
                    />
                  ) : (
                    <div className="w-full rounded-lg border px-3 py-2 text-sm border-slate-100 bg-slate-50">{displayedUser.email ?? "-"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{FIELD_LABELS.first_name}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={(editData as any)?.first_name ?? ""}
                      onChange={(e) => handleEditChange("first_name", e.target.value)}
                      className={inputClass(false)}
                    />
                  ) : (
                    <div className="w-full rounded-lg border px-3 py-2 text-sm border-slate-100 bg-slate-50">{displayedUser.first_name ?? "-"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{FIELD_LABELS.last_name}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={(editData as any)?.last_name ?? ""}
                      onChange={(e) => handleEditChange("last_name", e.target.value)}
                      className={inputClass(false)}
                    />
                  ) : (
                    <div className="w-full rounded-lg border px-3 py-2 text-sm border-slate-100 bg-slate-50">{displayedUser.last_name ?? "-"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{FIELD_LABELS.position}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={(editData as any)?.position ?? ""}
                      onChange={(e) => handleEditChange("position", e.target.value)}
                      className={inputClass(false)}
                    />
                  ) : (
                    <div className="w-full rounded-lg border px-3 py-2 text-sm border-slate-100 bg-slate-50">{displayedUser.position ?? "-"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{FIELD_LABELS.department_name}</label>
                  {isEditing ? (
                    <select
                      value={(editData as any)?.department_id ?? ""}
                      onChange={(e) => handleEditChange("department_id", e.target.value)}
                      className={inputClass(false)}
                      disabled={loadingOptions}
                    >
                      <option value="">-- เลือกแผนก --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full rounded-lg border px-3 py-2 text-sm border-slate-100 bg-slate-50">{getDisplayDepartment(displayedUser)}</div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{FIELD_LABELS.role}</label>
                  {isEditing ? (
                    <div>
                      <select
                        value={selectedRoleId ?? 0}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setSelectedRoleId(v);
                          const sel = roles.find((rr) => rr.id === v);
                          handleEditChange("role", sel ? (sel.name ?? sel.name ?? String(sel.id)) : "");
                        }}
                        className={inputClass(false)}
                        disabled={loadingOptions}
                      >
                        <option value={0}>-- เลือกบทบาท --</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name ?? "-"}
                          </option>
                        ))}
                      </select>
                      {optionsError && <div className="mt-1 text-xs text-rose-600">{optionsError}</div>}
                    </div>
                  ) : (
                    <div className="w-full rounded-lg border px-3 py-2 text-sm border-slate-100 bg-slate-50">{getDisplayRole(displayedUser)}</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 pb-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
          {!isEditing ? (
            <>
              <button
                onClick={() => {
                  setEditData(makeEditable(displayedUser));
                  setIsEditing(true);
                }}
                className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
              >
                แก้ไข
              </button>

              <button
                onClick={() => {
                  setEditData(displayedUser ? { ...displayedUser } : null);
                  onClose();
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ปิด
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>

              <button
                onClick={() => {
                  setEditData(displayedUser ? { ...displayedUser } : null);
                  setIsEditing(false);
                  setSelectedRoleId(0);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
