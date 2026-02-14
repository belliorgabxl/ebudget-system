"use client";
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { X } from "lucide-react";
import type { OrganizationResponse } from "@/dto/organizationDto";

interface EditOrganizationModalProps {
  org: OrganizationResponse;
  onSave: (org: OrganizationResponse) => void;
  onClose: () => void;
}

export default function EditOrganizationModal({
  org,
  onSave,
  onClose,
}: EditOrganizationModalProps) {
  const { push } = useToast();
  const [editing, setEditing] = useState<OrganizationResponse>(org);

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

  const validateForm = () => {
    if (!editing?.name?.trim()) {
      push('error', 'กรุณาระบุชื่อองค์กร');
      return false;
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
          <h2 className="text-xl font-bold text-gray-900">แก้ไของค์กร</h2>
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
                value={editing?.name || ""}
                onChange={(e) =>
                  setEditing(
                    editing
                      ? { ...editing, name: e.target.value }
                      : org
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภท
              </label>
              <input
                value={editing?.type || ""}
                onChange={(e) =>
                  setEditing(
                    editing
                      ? { ...editing, type: e.target.value }
                      : org
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            <span className="text-red-500">*</span> ฟีลด์ที่จำเป็น
          </p>
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
              if (validateForm() && editing) {
                onSave(editing);
              }
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
