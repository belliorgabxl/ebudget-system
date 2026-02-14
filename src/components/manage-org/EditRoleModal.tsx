"use client";
import React, { useEffect, useRef, useState } from "react";
import type { OrganizationRole } from "@/dto/organizationDto";
import { UpdateRoleFromApi } from "@/api/role.client";
import { isProtectedRoleCode } from "@/constants/defaultRoles";
import { useToast } from "@/components/ToastProvider";

interface EditRoleModalProps {
  role: OrganizationRole;
  onSave: (role: any) => void;
  onClose: () => void;
}

export default function EditRoleModal({ role, onSave, onClose }: EditRoleModalProps) {
  const { push } = useToast();
  const [form, setForm] = useState({
    name: role.name,
    display_name: role.display_name || role.name,
    description: role.description || "",
    approval_level: role.approval_level || 0,
    role_code: role.code || "",
    can_create_budget_plan: role.can_create_budget_plan || false,
    can_view_all_plans: role.can_view_all_plans || false,
    can_approve: role.can_approve || false,
    is_active: typeof role.is_active === 'boolean' ? role.is_active : true,
  });

  // Check if this is a protected role
  const isProtected = isProtectedRoleCode(role.code || "");

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && e.target === modalRef.current && !contentRef.current?.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleSave = async () => {
    // Validate required fields
    if (!form.name.trim()) {
      push('error', 'กรุณากรอกชื่อบทบาท');
      return;
    }
    if (!form.role_code.trim()) {
      push('error', 'กรุณากรอกรหัสบทบาท');
      return;
    }
    if (form.approval_level < 0) {
      push('error', 'ระดับการอนุมัติต้องไม่น้อยกว่า 0');
      return;
    }

    // For protected roles, only update editable fields
    const updatedRoleData = isProtected ? {
      name: form.name.trim(),
      display_name: form.display_name.trim() || form.name.trim(),
      description: form.description.trim(),
      approval_level: form.approval_level,
      // Preserve original values for protected fields
      role_code: role.code, // Use original code
      can_create_budget_plan: role.can_create_budget_plan,
      can_view_all_plans: role.can_view_all_plans,
      can_approve: role.can_approve,
      can_edit_qas: role.can_edit_qas,
      is_system_role: role.is_system,
      is_active: form.is_active,
    } : {
      // For non-protected roles, allow all fields to be updated
      name: form.name.trim(),
      display_name: form.display_name.trim() || form.name.trim(),
      description: form.description.trim(),
      approval_level: form.approval_level,
      role_code: form.role_code.trim(),
      can_create_budget_plan: form.can_create_budget_plan,
      can_view_all_plans: form.can_view_all_plans,
      can_approve: form.can_approve,
      is_system_role: role.is_system,
      is_active: form.is_active,
    };

    try {
      const result = await UpdateRoleFromApi(role.id, updatedRoleData);
      if (result.success) {
        push('success', 'แก้ไขบทบาทสำเร็จ');
        onSave(result.data);
      } else {
        push('error', 'ไม่สามารถแก้ไขบทบาทได้', result.message || 'Unknown error');
      }
    } catch (error) {
      push('error', 'เกิดข้อผิดพลาดในการแก้ไขบทบาท');
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        ref={contentRef}
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">แก้ไขบทบาท</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {/* Protected Role Warning */}
          {isProtected && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <strong>⚠️ บทบาทระบบ:</strong> บทบาทนี้เป็นบทบาทเริ่มต้นของระบบ สามารถแก้ไขได้เฉพาะชื่อ, ชื่อแสดง, คำอธิบาย และระดับการอนุมัติเท่านั้น
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อบทบาท <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="เช่น custom_manager"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อแสดง
              </label>
              <input
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="เช่น Custom Manager"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสบทบาท <span className="text-red-500">*</span>
              </label>
              <input
                value={form.role_code}
                onChange={(e) => setForm({ ...form, role_code: e.target.value })}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 ${isProtected ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="เช่น custom_manager"
                disabled={isProtected}
                title={isProtected ? "ไม่สามารถแก้ไขรหัสบทบาทของบทบาทระบบได้" : ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ระดับการอนุมัติ
              </label>
              <input
                type="number"
                min="0"
                value={form.approval_level}
                onChange={(e) => setForm({ ...form, approval_level: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Active status — compact, right-aligned */}
            <div className="flex flex-col items-start gap-2">
              <div className="text-sm text-gray-500">สถานะ</div>
              <div className="flex items-center gap-3">

                <button
                  onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, is_active: !p.is_active })); }}
                  aria-pressed={form.is_active}
                  title={form.is_active ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}
                  className={`relative inline-flex items-center h-5 w-10 rounded-full transition-colors focus:outline-none ${form.is_active ? 'bg-green-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                  <span className="sr-only">{form.is_active ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'}</span>
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              rows={3}
              placeholder="อธิบายบทบาทนี้"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สิทธิ์</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.can_create_budget_plan}
                  onChange={(e) => setForm({ ...form, can_create_budget_plan: e.target.checked })}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isProtected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isProtected}
                />
                <label className={`ml-2 block text-sm ${isProtected ? 'text-gray-500' : 'text-gray-900'}`}>
                  สร้างแผนงบประมาณ
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.can_view_all_plans}
                  onChange={(e) => setForm({ ...form, can_view_all_plans: e.target.checked })}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isProtected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isProtected}
                />
                <label className={`ml-2 block text-sm ${isProtected ? 'text-gray-500' : 'text-gray-900'}`}>
                  ดูแผนทั้งหมด
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.can_approve}
                  onChange={(e) => setForm({ ...form, can_approve: e.target.checked })}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isProtected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isProtected}
                />
                <label className={`ml-2 block text-sm ${isProtected ? 'text-gray-500' : 'text-gray-900'}`}>
                  อนุมัติ
                </label>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
