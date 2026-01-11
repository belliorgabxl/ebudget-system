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
//   loadKpis: () => Promise<KpiMaster[]>;
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
//   loadKpis,
}: Props) {
  const [allKpis, setAllKpis] = useState<KpiMaster[]>([]);
  const [draft, setDraft] = useState<KpiSectionDraft>({
    kpi_ids: [],
  });

  useEffect(() => {
    if (!isEditing) return;

    // loadKpis().then(setAllKpis);

    setDraft({
      kpi_ids: selectedKpis.map((k) => k.id),
    });
  }, [isEditing, selectedKpis,]); // loadkpis แปะไว้กันลืมหว่ะ

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
      onEdit={() => canEdit && onEdit()}
      onCancel={onCancel}
      onSave={() => onSave(draft)}
    >
      {!isEditing ? (
        <Field label="ตัวชี้วัดที่เลือก" value={selectedLabels || "—"} />
      ) : (
        <div className="space-y-4">
          <BadgeLabel title="เลือกตัวชี้วัด (เลือกได้หลายข้อ)" />

          <div className="space-y-2">
            {allKpis.map((kpi) => {
              const checked = draft.kpi_ids.includes(kpi.id);

              return (
                <label key={kpi.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
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
        </div>
      )}
    </SectionShell>
  );
}
