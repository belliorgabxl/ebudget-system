"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell } from "./SectionShell";
import {
  BadgeLabel,
  Field,
  Grid2,
  dateOrDash,
} from "@/components/project/Helper";
import type { GeneralInfoForUpdateData } from "@/dto/projectDto";
import { PROJECT_TYPE_LABEL } from "@/constants/project";

type Props = {
  project: GeneralInfoForUpdateData;
  canEdit: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (draft: GeneralInfoForUpdateData) => Promise<void> | void;
};

export function GeneralInfoSection({
  project,
  canEdit,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: Props) {
  const original = project;

  const [draft, setDraft] = useState<GeneralInfoForUpdateData>(original);

  useEffect(() => {
    if (isEditing) setDraft(original);
  }, [isEditing, original]);

  const planTypeLabel = useMemo(() => {
    return PROJECT_TYPE_LABEL[draft?.plan_type] || "—";
  }, [draft?.plan_type]);

  const disabledClass = !canEdit ? "opacity-60 pointer-events-none" : "";

  return (
    <SectionShell
      title="ข้อมูลทั่วไป"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={() => canEdit && onEdit()}
      onCancel={() => {
        setDraft(original);
        onCancel();
      }}
      onSave={() => onSave(draft)}
    >
      {!isEditing ? (
        <Grid2>
          <Field label="ชื่อโครงการ" value={original?.name || "—"} />
          <Field
            label="ประเภทโครงการ"
            value={PROJECT_TYPE_LABEL[original?.plan_type] || "—"}
          />
          <Field label="รหัสโครงการ" value={original?.code || "—"} />

          <Field
            label="วันเริ่มโครงการ"
            value={dateOrDash(original?.start_date)}
          />
          <Field
            label="วันสิ้นสุดโครงการ"
            value={dateOrDash(original?.end_date)}
          />

          <Field label="สถานที่" value={original?.location || "—"} />

          <Field label="หลักการและเหตุผล">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {original?.rationale?.trim() || "—"}
            </p>
          </Field>

          <Field label="เกี่ยวกับโครงการ">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {original?.description?.trim() || "—"}
            </p>
          </Field>

          <Field label="เป้าหมายเชิงปริมาณ">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {original?.quantitative_goal?.trim() || "—"}
            </p>
          </Field>

          <Field label="เป้าหมายเชิงคุณภาพ">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {original?.qualitative_goal?.trim() || "—"}
            </p>
          </Field>
        </Grid2>
      ) : (
        <div className={disabledClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 md:col-span-2">
              <BadgeLabel title="ชื่อโครงการ" />
              <input
                value={draft.name ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <BadgeLabel title="ประเภทโครงการ" />
              <select
                value={draft.plan_type ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, plan_type: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">เลือกประเภท</option>
                <option value="project">ทั่วไป</option>
                <option value="regular_work">แผนงานประจำ</option>
                <option value="special_project">โครงการพิเศษ / พัฒนา</option>
              </select>
              <p className="text-xs text-gray-500">แสดงผล: {planTypeLabel}</p>
            </label>

            <label className="space-y-1">
               <BadgeLabel title="รหัสโครงการ" />
              <input
                value={draft.code ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, code: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
            <BadgeLabel title="วันเริ่มโครงการ" />
              <input
                type="date"
                value={(draft.start_date ?? "").slice(0, 10)}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, start_date: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <BadgeLabel title="วันสิ้นสุดโครงการ" />
              <input
                type="date"
                value={(draft.end_date ?? "").slice(0, 10)}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, end_date: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <BadgeLabel title="สถานที่" />
              <input
                value={draft.location ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, location: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <BadgeLabel title="หลักการและเหตุผล" />
              <textarea
                rows={3}
                value={draft.rationale ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, rationale: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              {" "}
              <BadgeLabel title="เกี่ยวกับโครงการ" />
              <textarea
                rows={3}
                value={draft.description ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              {" "}
              <BadgeLabel title="เป้าหมายเชิงปริมาณ" />
              <textarea
                rows={2}
                value={draft.quantitative_goal ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, quantitative_goal: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <BadgeLabel title="เป้าหมายเชิงคุณภาพ" />
              <textarea
                rows={2}
                value={draft.qualitative_goal ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, qualitative_goal: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <input type="hidden" value={draft.project_id} readOnly />
          </div>
        </div>
      )}
    </SectionShell>
  );
}
