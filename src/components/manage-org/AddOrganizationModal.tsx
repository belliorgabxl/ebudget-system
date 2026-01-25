"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Organization } from "@/resource/mock-organization";

interface AddOrganizationModalProps {
  onAdd: (org: Partial<Organization>) => void;
  onClose: () => void;
}

export default function AddOrganizationModal({
  onAdd,
  onClose,
}: AddOrganizationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    totalBudget: 0,
    totalDepartments: 0,
    totalEmployees: 0,
    totalProjects: 0,
    status: "active" as "active" | "inactive",
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        e.target === modalRef.current &&
        !contentRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

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
          <h2 className="text-xl font-bold text-gray-900">เพิ่มองค์กร</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อองค์กร <span className="text-red-500">*</span>
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="เช่น บริษัท ABC จำกัด"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัส <span className="text-red-500">*</span>
              </label>
              <input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="เช่น ABC"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียด
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="รายละเอียดเกี่ยวกับองค์กร"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                งบประมาณ
              </label>
              <input
                type="number"
                value={formData.totalBudget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalBudget: Number(e.target.value),
                  })
                }
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หน่วยงาน
              </label>
              <input
                type="number"
                value={formData.totalDepartments}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalDepartments: Number(e.target.value),
                  })
                }
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                พนักงาน
              </label>
              <input
                type="number"
                value={formData.totalEmployees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalEmployees: Number(e.target.value),
                  })
                }
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                โครงการ
              </label>
              <input
                type="number"
                value={formData.totalProjects}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalProjects: Number(e.target.value),
                  })
                }
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: (e.target.value === "active"
                      ? "active"
                      : "inactive") as "active" | "inactive",
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </select>
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
            onClick={() => {
              if (formData.name && formData.code) {
                onAdd(formData);
              }
            }}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
}
