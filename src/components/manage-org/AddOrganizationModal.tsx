"use client";
import React, { useEffect, useRef, useState } from "react";
import { Plus, X, ChevronDown, Edit2 } from "lucide-react";
import { DEFAULT_ROLES } from "@/constants/defaultRoles";
import { useToast } from "@/components/ToastProvider";

// Editable role for approval levels display
interface EditableRole {
  code: string;
  name: string;
  display_name: string;
  description: string;
  approval_level: number;
  can_create_budget_plan: boolean;
  can_view_all_plans: boolean;
  can_approve: boolean;
  can_edit_qas: boolean;
  isProtected: boolean; // Whether this is a default system role
}

interface ApprovalLevel {
  level: number;
  roles: EditableRole[];
}

interface AddOrganizationModalProps {
  onAdd: (org: {
    name: string;
    type?: string;
    approvalLevels: ApprovalLevel[];
  }) => void;
  onClose: () => void;
}

export default function AddOrganizationModal({
  onAdd,
  onClose,
}: AddOrganizationModalProps) {
  const { push } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
  });
  
  // Initialize with default roles grouped by approval_level
  const initializeDefaultRoles = (): ApprovalLevel[] => {
    const rolesByLevel: { [key: number]: EditableRole[] } = {};
    
    DEFAULT_ROLES.forEach(role => {
      if (!rolesByLevel[role.approval_level]) {
        rolesByLevel[role.approval_level] = [];
      }
      rolesByLevel[role.approval_level].push({
        ...role,
        isProtected: true
      });
    });
    
    return Object.keys(rolesByLevel)
      .map(Number)
      .sort((a, b) => a - b)
      .map(level => ({
        level,
        roles: rolesByLevel[level]
      }));
  };
  
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>(initializeDefaultRoles());
  const [openDropdownLevel, setOpenDropdownLevel] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<{ levelIndex: number; roleIndex: number } | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; display_name: string; description: string; approval_level: number }>({ name: "", display_name: "", description: "", approval_level: 1 });

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

  const handleRemoveRoleFromLevel = (levelIndex: number, roleCode: string) => {
    const updated = [...approvalLevels];
    const role = updated[levelIndex].roles.find(r => r.code === roleCode);
    
    // Don't allow removing protected roles
    if (role?.isProtected) {
      push('error', 'ไม่สามารถลบบทบาทระบบได้');
      return;
    }
    
    updated[levelIndex].roles = updated[levelIndex].roles.filter((r) => r.code !== roleCode);
    setApprovalLevels(updated);
  };

  const handleEditRole = (levelIndex: number, roleIndex: number) => {
    const role = approvalLevels[levelIndex].roles[roleIndex];
    setEditingRole({ levelIndex, roleIndex });
    setEditForm({
      name: role.name, // Keep original name (disabled)
      display_name: role.display_name,
      description: role.description,
      approval_level: role.approval_level // Keep original approval level (disabled)
    });
  };

  const handleSaveRole = () => {
    if (!editingRole) return;
    
    if (!editForm.name.trim()) {
      push('error', 'กรุณากรอกชื่อบทบาท');
      return;
    }
    
    if (!editForm.display_name.trim()) {
      push('error', 'กรุณากรอกชื่อแสดง');
      return;
    }
    
    const updated = [...approvalLevels];
    const role = updated[editingRole.levelIndex].roles[editingRole.roleIndex];
    
    // Update editable fields (name, display_name and description)
    role.name = editForm.name.trim();
    role.display_name = editForm.display_name.trim();
    role.description = editForm.description.trim();
    
    // Keep approval_level unchanged
    updated[editingRole.levelIndex].roles[editingRole.roleIndex] = role;
    
    setApprovalLevels(updated);
    setEditingRole(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      push('error', 'กรุณาระบุชื่อองค์กร');
      return false;
    }
    
    for (const level of approvalLevels) {
      if (level.roles.length === 0) {
        push('error', `กรุณาเพิ่มอย่างน้อย 1 บทบาทใน Approval Level ${level.level}`);
        return false;
      }
    }
    
    return true;
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        ref={contentRef}
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">เพิ่มองค์กร</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 gap-4">
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภท
              </label>
              <input
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="เช่น เอกชน, รัฐบาล"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Approval Levels Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">ลำดับการอนุมัติพื้นฐาน</h3>
              <p className="text-sm text-gray-500">
                กำหนดลำดับการอนุมัติและบทบาทในแต่ละลำดับ
                {approvalLevels.length > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    (จำนวน {approvalLevels.length} ลำดับ)
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-4">
              {approvalLevels.map((level, levelIndex) => (
                <div
                  key={levelIndex}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      ลำดับที่ {level.level}
                    </h4>
                  </div>

                    {/* Selected Roles */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {level.roles.map((role, roleIndex) => (
                        <span
                          key={role.code}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                            role.isProtected 
                              ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {role.display_name}
                          <button
                            onClick={() => handleEditRole(levelIndex, roleIndex)}
                            className="hover:opacity-70"
                            title="แก้ไขบทบาท"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          {!role.isProtected && (
                            <button
                              onClick={() => handleRemoveRoleFromLevel(levelIndex, role.code)}
                              className="hover:opacity-70"
                              title="ลบบทบาท"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>

                    {level.roles.length === 0 && (
                      <p className="text-xs text-amber-600 mt-2">
                        ⚠️ กรุณาเลือกอย่างน้อย 1 บทบาทสำหรับลำดับนี้
                      </p>
                    )}
                  </div>
                ))}
              </div>
          </div>

          <p className="text-xs text-gray-500">
            <span className="text-amber-500">💡 หมายเหตุ:</span> บทบาทที่มีกรอบสีเหลืองเป็นบทบาทระบบ สามารถแก้ไขชื่อและรายละเอียดได้เท่านั้น
          </p>
        </div>

        {/* Edit Role Modal */}
        {editingRole !== null && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="border-b px-6 py-4">
                <h3 className="font-bold text-lg">แก้ไขบทบาท</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {/* Protected Role Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <strong>⚠️ บทบาทระบบ:</strong> บทบาทนี้เป็นบทบาทเริ่มต้นของระบบ สามารถแก้ไขได้เฉพาะชื่อบทบาท, ชื่อแสดง และคำอธิบายเท่านั้น
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อบทบาท <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="ชื่อบทบาท"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รหัสบทบาท
                    </label>
                    <input
                      value={approvalLevels[editingRole.levelIndex].roles[editingRole.roleIndex].code}
                      disabled
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
                      placeholder="รหัสบทบาท"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อแสดง <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={editForm.display_name}
                      onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="ชื่อแสดง"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ระดับการอนุมัติ
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.approval_level}
                      disabled
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    rows={3}
                    placeholder="อธิบายบทบาท"
                  />
                </div>
              </div>
              <div className="border-t px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveRole}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}

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
              if (validateForm()) {
                onAdd({
                  name: formData.name.trim(),
                  type: formData.type.trim() || undefined,
                  approvalLevels: approvalLevels,
                });
              }
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
}
