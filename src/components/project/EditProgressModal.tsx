"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Upload,
  Loader2,
  FileText,
  Trash2,
  Download,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import type { ProjectProgress, ProjectProgressFile } from "@/dto/projectDto";

interface EditProgressModalProps {
  progress: ProjectProgress;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE_MB = 50;

export default function EditProgressModal({
  progress,
  onClose,
  onSuccess,
}: EditProgressModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ProjectProgressFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | number | null>(null);

  const [form, setForm] = useState({
    description: progress.description ?? "",
    responsible_name: progress.responsible_name ?? "",
    start_date: progress.start_date
      ? progress.start_date.slice(0, 10)
      : "",
    end_date: progress.end_date ? progress.end_date.slice(0, 10) : "",
    remarks: progress.remarks ?? "",
    budget_cost_used:
      progress.budget_cost_used != null
        ? String(progress.budget_cost_used)
        : "",
  });

  const setF = (field: keyof typeof form, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  // Load existing files on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingFiles(true);
    fetch(`/api/project-progress/${progress.id}/files`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setExistingFiles(Array.isArray(json?.data) ? json.data : []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingFiles(false);
      });
    return () => {
      cancelled = true;
    };
  }, [progress.id]);

  const handleDownload = async (file: ProjectProgressFile) => {
    try {
      const res = await fetch(
        `/api/project-progress/${progress.id}/files/${file.id}/download-url`
      );
      const json = await res.json();
      const url = json?.data?.url ?? json?.data;
      if (!url) throw new Error("ไม่พบ URL");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("ไม่สามารถดาวน์โหลดไฟล์ได้");
    }
  };

  const handleDeleteFile = async (file: ProjectProgressFile) => {
    if (!window.confirm(`ต้องการลบไฟล์ "${file.file_name}" ใช่หรือไม่?`)) return;
    setDeletingFileId(file.id);
    try {
      const res = await fetch(
        `/api/project-progress/${progress.id}/files/${file.id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? "ลบไฟล์ไม่สำเร็จ");
      setExistingFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.success("ลบไฟล์สำเร็จ");
    } catch (err: any) {
      toast.error(err?.message ?? "ลบไฟล์ไม่สำเร็จ");
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const oversized = selected.filter(
      (f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024
    );
    if (oversized.length > 0) {
      toast.error(
        `ไฟล์ ${oversized.map((f) => f.name).join(", ")} มีขนาดเกิน ${MAX_FILE_SIZE_MB} MB`
      );
      return;
    }
    setNewFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...selected.filter((f) => !names.has(f.name))];
    });
    e.target.value = "";
  };

  const removeNewFile = (name: string) =>
    setNewFiles((p) => p.filter((f) => f.name !== name));

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      toast.error("กรุณาระบุรายละเอียดความคืบหน้า");
      return;
    }

    const fd = new FormData();
    fd.append("description", form.description);
    if (form.responsible_name) fd.append("responsible_name", form.responsible_name);
    if (form.start_date) fd.append("start_date", form.start_date);
    if (form.end_date) fd.append("end_date", form.end_date);
    if (form.remarks) fd.append("remarks", form.remarks);
    if (form.budget_cost_used) fd.append("budget_cost_used", form.budget_cost_used);
    newFiles.forEach((f) => fd.append("file", f));

    setIsLoading(true);
    try {
      const res = await fetch(`/api/project-progress/${progress.id}`, {
        method: "PATCH",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.message ?? json.error ?? "บันทึกไม่สำเร็จ");
      }
      toast.success("แก้ไขความคืบหน้าสำเร็จ");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            แก้ไขความคืบหน้า #{progress.sequence_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียดความคืบหน้า{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px] resize-y"
              placeholder="อธิบายความคืบหน้า..."
              value={form.description}
              onChange={(e) => setF("description", e.target.value)}
            />
          </div>

          {/* Responsible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ผู้รับผิดชอบ
            </label>
            <input
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="ชื่อผู้รับผิดชอบ"
              value={form.responsible_name}
              onChange={(e) => setF("responsible_name", e.target.value)}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่เริ่ม
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.start_date}
                onChange={(e) => setF("start_date", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.end_date}
                onChange={(e) => setF("end_date", e.target.value)}
              />
            </div>
          </div>

          {/* Budget used */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              งบประมาณที่ใช้ (บาท)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="0.00"
              value={form.budget_cost_used}
              onChange={(e) => setF("budget_cost_used", e.target.value)}
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมายเหตุ
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[60px] resize-y"
              placeholder="หมายเหตุเพิ่มเติม..."
              value={form.remarks}
              onChange={(e) => setF("remarks", e.target.value)}
            />
          </div>

          {/* Existing files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ไฟล์ที่มีอยู่แล้ว
            </label>
            {loadingFiles ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังโหลดไฟล์...
              </div>
            ) : existingFiles.length === 0 ? (
              <p className="text-sm text-gray-400 italic">ยังไม่มีไฟล์แนบ</p>
            ) : (
              <ul className="space-y-1.5">
                {existingFiles.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span className="text-xs text-blue-700 truncate">
                        {f.file_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <button
                        onClick={() => handleDownload(f)}
                        className="text-blue-500 hover:text-blue-700"
                        title="ดาวน์โหลด"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(f)}
                        disabled={deletingFileId === f.id}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                        title="ลบไฟล์"
                      >
                        {deletingFileId === f.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* New file upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เพิ่มไฟล์แนบใหม่{" "}
              {!loadingFiles && existingFiles.length === 0 && (
                <span className="text-gray-400 font-normal">
                  (ขนาดสูงสุด {MAX_FILE_SIZE_MB} MB ต่อไฟล์)
                </span>
              )}
            </label>
            {!loadingFiles && existingFiles.length > 0 ? (
              <div className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400 w-full justify-center select-none">
                <Upload className="h-4 w-4" />
                ไม่สามารถเพิ่มไฟล์ได้ เนื่องจากมีไฟล์แนบอยู่แล้ว
              </div>
            ) : (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={loadingFiles}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" />
                  เลือกไฟล์แนบ
                </button>
              </>
            )}
            {newFiles.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {newFiles.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-700 truncate">
                        {f.name}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        ({(f.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeNewFile(f.name)}
                      className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            บันทึกการแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}
