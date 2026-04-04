"use client";

import { useRef, useState } from "react";
import { X, Upload, Loader2, FileText, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

interface AddProgressModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE_MB = 50; // 50 MB per file limit

export default function AddProgressModal({ projectId, onClose, onSuccess }: AddProgressModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    description: "",
    responsible_name: "",
    start_date: "",
    end_date: "",
    remarks: "",
    budget_cost_used: "",
  });

  const setF = (field: keyof typeof form, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`ไฟล์มีขนาดเกิน ${MAX_FILE_SIZE_MB} MB`);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      toast.error("กรุณาระบุรายละเอียดความคืบหน้า");
      return;
    }

    const fd = new FormData();
    fd.append("project_id", projectId);
    fd.append("description", form.description);
    if (form.responsible_name) fd.append("responsible_name", form.responsible_name);
    if (form.start_date) fd.append("start_date", form.start_date);
    if (form.end_date) fd.append("end_date", form.end_date);
    if (form.remarks) fd.append("remarks", form.remarks);
    if (form.budget_cost_used) fd.append("budget_cost_used", form.budget_cost_used);
    if (file) fd.append("file", file);

    setIsLoading(true);
    try {
      const res = await fetch("/api/project-progress", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.message ?? json.error ?? "บันทึกไม่สำเร็จ");
      toast.success("บันทึกความคืบหน้าสำเร็จ");
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
          <h2 className="text-base font-semibold text-gray-900">บันทึกความคืบหน้าโครงการ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียดความคืบหน้า <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่ม</label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.start_date}
                onChange={(e) => setF("start_date", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">งบประมาณที่ใช้ (บาท)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[60px] resize-y"
              placeholder="หมายเหตุเพิ่มเติม..."
              value={form.remarks}
              onChange={(e) => setF("remarks", e.target.value)}
            />
          </div>

          {/* File upload — 1 PDF only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              แนบไฟล์ PDF{" "}
              <span className="text-gray-400 font-normal">(1 ไฟล์ ขนาดสูงสุด {MAX_FILE_SIZE_MB} MB)</span>
            </label>
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileChange} />
            {file ? (
              <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-700 truncate">{file.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors w-full justify-center"
              >
                <Upload className="h-4 w-4" />
                เลือกไฟล์ PDF
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            บันทึกความคืบหน้า
          </button>
        </div>
      </div>
    </div>
  );
}
