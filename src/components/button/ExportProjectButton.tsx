"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { ProjectInformationResponse } from "@/dto/projectDto";
import { ProjectDetailPDF } from "@/lib/PDF/project-detail-pdf";

interface DownloadProps {
  id: string;
}

export function ExportPDFDocument({ id }: DownloadProps) {
  const [loading, setLoading] = useState(false);

  const exportPDF = async () => {
    try {
      setLoading(true);

      const r = await fetch(
        `/api/projects/information?project_id=${encodeURIComponent(id)}`,
        { method: "GET", cache: "no-store" }
      );

      if (!r.ok) {
        const msg = await r.text();
        throw new Error(`โหลดข้อมูลโปรเจ็คไม่สำเร็จ (${r.status}): ${msg}`);
      }

      const data = (await r.json()) as ProjectInformationResponse;
      ProjectDetailPDF(data);
    } catch (err) {
      console.error("[ExportPDFDocument] exportPDF error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={exportPDF}
      className={`flex items-center justify-center lg:gap-3 gap-1 rounded-md
        border border-gray-300 px-4 py-1 bg-slate-100 cursor-pointer text-xs text-black hover:bg-slate-300
        ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <Download className="w-4 h-4 text-gray-800" />
      <p className="line-clamp-1">
        {loading ? "กำลังสร้าง..." : "ดาวน์โหลดเอกสาร"}
      </p>
    </button>
  );
}
