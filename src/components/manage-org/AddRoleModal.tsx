"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Role } from "@/resource/mock-org-detail";

interface AddRoleModalProps {
  onSave: (role: Role) => void;
  onClose: () => void;
}

function generateRoleId() {
  return `ROLE-${Math.floor(Math.random() * 100000)}`;
}

export default function AddRoleModal({ onSave, onClose }: AddRoleModalProps) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    permissionsText: "",
    approvalOrder: "",
  });

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

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) return;
    const permissions = form.permissionsText
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const approvalOrder = form.approvalOrder.trim() ? parseInt(form.approvalOrder.trim()) : undefined;
    const newRole: Role = {
      id: generateRoleId(),
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      permissions,
      userCount: 0,
      approvalOrder,
      createdAt: new Date().toISOString(),
    };
    onSave(newRole);
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
          <h2 className="text-xl font-bold text-gray-900">เพิ่มบทบาท</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสบทบาท <span className="text-red-500">*</span>
              </label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="เช่น custom_role"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อบทบาท <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="เช่น ผู้ดูแลระบบภายใน"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ลำดับในการอนุมัติ
            </label>
            <input
              type="number"
              value={form.approvalOrder}
              onChange={(e) => setForm({ ...form, approvalOrder: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="เช่น 1, 2, 3"
              min="1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              rows={3}
              placeholder="อธิบายบทบาทนี้"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">สิทธิ์ (คั่นด้วยจุลภาค)</label>
            <input
              value={form.permissionsText}
              onChange={(e) => setForm({ ...form, permissionsText: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="view_dashboard, manage_projects"
            />
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
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            เพิ่มบทบาท
          </button>
        </div>
      </div>
    </div>
  );
}
