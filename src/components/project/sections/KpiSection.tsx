"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell } from "./SectionShell";
import { BadgeLabel, Field } from "@/components/project/Helper";
import { KpiMaster, ProjectKPI, KpiSectionDraft } from "@/dto/projectDto";

type Props = {
  projectId: string;
  selectedKpis: ProjectKPI[];
  canEdit: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (draft: KpiSectionDraft) => Promise<void> | void;
};

export function KpiSection({
  projectId,
  selectedKpis,
  canEdit,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: Props) {
  const [allKpis, setAllKpis] = useState<KpiMaster[]>([]);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [draft, setDraft] = useState<KpiSectionDraft>({
    kpi_ids: [],
  });

  useEffect(() => {
    if (!isEditing) return;
    setDraft({ kpi_ids: selectedKpis.map((k) => k.id) });
    if (allKpis.length > 0) return;
    setKpisLoading(true);
    fetch("/api/kpis", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: KpiMaster[]) => setAllKpis(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setKpisLoading(false));
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedLabels = useMemo(() => {
    const selectedIds = selectedKpis.map((k) => k.id);

    return allKpis
      .filter((k) => selectedIds.includes(k.id))
      .map((k) => k.name)
      .join(", ");
  }, [allKpis, selectedKpis]);

  return (
    <SectionShell
      title="ตัวชี้วัดความสำเร็จของโครงการ (KPIs)"
      isEditing={isEditing}
      isSaving={isSaving}
      canEdit={canEdit}
      onEdit={() => canEdit && onEdit()}
      onCancel={onCancel}
      onSave={() => onSave(draft)}
    >
      {!isEditing ? (
        selectedKpis.length === 0 ? (
          <p className="text-sm text-gray-400 italic">ไม่มีข้อมูล</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 mt-1">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="w-12 px-4 py-2 text-left font-medium text-gray-600 border-r border-gray-200">ลำดับ</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">ตัวชี้วัด</th>
                  <th className="w-36 px-4 py-2 text-left font-medium text-gray-600">เป้าหมาย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedKpis.map((k, i) => (
                  <tr key={k.id} className="align-top">
                    <td className="px-4 py-2 border-r border-gray-200 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-2">
                      <p className="font-medium text-gray-800">{k.indicator || "—"}</p>
                      {k.description && <p className="text-xs text-gray-500 mt-0.5">{k.description}</p>}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{k.target_value ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <BadgeLabel title="เลือกตัวชี้วัด (เลือกได้หลายข้อ)" />
          {kpisLoading ? (
            <p className="text-sm text-gray-400 italic">กำลังโหลด...</p>
          ) : allKpis.length === 0 ? (
            <p className="text-sm text-gray-400 italic">ไม่พบตัวชี้วัดในระบบ</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {allKpis.map((kpi) => {
                const checked = draft.kpi_ids.includes(kpi.id);
                return (
                  <label key={kpi.id} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-2 py-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      className="mt-0.5"
                      onChange={(e) => {
                        setDraft((d) => ({
                          kpi_ids: e.target.checked
                            ? [...d.kpi_ids, kpi.id]
                            : d.kpi_ids.filter((id) => id !== kpi.id),
                        }));
                      }}
                    />
                    <span>
                      {kpi.name}{" "}
                      <span className="text-xs text-gray-500">
                        ({kpi.type === "output" ? "ผลผลิต" : "ผลลัพธ์"})
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </SectionShell>
  );
}
