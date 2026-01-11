"use client";

import { useEffect, useState } from "react";
import { SectionShell } from "./SectionShell";
import { BadgeLabel } from "@/components/project/Helper";
import type {
  ObjectiveOutcomeDraft,
  ObjectiveOutcomeItemDraft,
} from "@/dto/sectionupdate";
import { Trash } from "lucide-react";

type Props = {
  projectId: string;

  initialObjectives: ObjectiveOutcomeItemDraft[];
  initialExpectations: ObjectiveOutcomeItemDraft[];

  canEdit: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (draft: ObjectiveOutcomeDraft) => Promise<void> | void;
};

export function ObjectiveOutcomeSection({
  projectId,
  initialObjectives,
  initialExpectations,
  canEdit,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<ObjectiveOutcomeDraft>({
    objectives: initialObjectives ?? [],
    expectations: initialExpectations ?? [],
  });

  useEffect(() => {
    if (!isEditing) return;
    setDraft({
      objectives: initialObjectives ?? [],
      expectations: initialExpectations ?? [],
    });
  }, [isEditing, initialObjectives, initialExpectations]);

  const renderList = (
    items: ObjectiveOutcomeItemDraft[],
    onChange: (idx: number, v: string) => void,
    onAdd: () => void,
    onRemove: (idx: number) => void,
    addLabel: string
  ) => (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <div key={it.id ?? `tmp-${idx}`} className="relative mt-2">
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            rows={3}
            value={it.description}
            onChange={(e) => onChange(idx, e.target.value)}
          />
          <button
            type="button"
            className="absolute right-2 top-2 rounded-full bg-red-500 text-white h-8 w-8 grid place-items-center"
            onClick={() => onRemove(idx)}
            aria-label="remove"
          >
            <Trash className="text-white h-5 w-5"/>
          </button>
        </div>
      ))}

      <button
        type="button"
        className="rounded-md bg-gray-200 px-3 py-2 text-sm"
        onClick={onAdd}
      >
        + {addLabel}
      </button>
    </div>
  );

  const disabledClass = !canEdit ? "opacity-60 pointer-events-none" : "";

  return (
    <SectionShell
      title="วัตถุประสงค์และผลที่คาดว่าจะได้รับ"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={() => canEdit && onEdit()}
      onCancel={onCancel}
      onSave={() => onSave(draft)}
    >
      {!isEditing ? (
        <div className="grid gap-4">
          <div className="space-y-2">
            <BadgeLabel title="วัตถุประสงค์ของโครงการ" />

            <div className="overflow-hidden rounded-lg border mt-4 border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="w-16 px-4 py-2 text-left font-medium text-gray-600 border-r border-gray-300">
                      ลำดับ
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      รายละเอียด
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-300">
                  {initialObjectives?.length ? (
                    initialObjectives.map((o, i) => (
                      <tr key={o.id ?? i} className="align-top">
                        <td className="px-4 py-2 border-r border-gray-300 text-gray-500">
                          {i + 1}
                        </td>
                        <td className="px-4 py-2 whitespace-pre-line leading-relaxed">
                          {o.description}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-3 text-center text-gray-400"
                      >
                        —
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-2">
            <BadgeLabel title="ผลที่คาดว่าจะได้รับ" />

            <div className="overflow-hidden rounded-lg border mt-4 border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="w-16 px-4 py-2 text-left font-medium text-gray-600 border-r border-gray-100">
                      ลำดับ
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      รายละเอียด
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-300">
                  {initialExpectations?.length ? (
                    initialExpectations.map((o, i) => (
                      <tr key={o.id ?? i} className="align-top">
                        <td className="px-4 py-2 border-r border-gray-300 text-gray-500">
                          {i + 1}
                        </td>
                        <td className="px-4 py-2 whitespace-pre-line leading-relaxed">
                          {o.description}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-3 text-center text-gray-400"
                      >
                        —
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className={disabledClass}>
          <div className="space-y-6">
            <div>
              <BadgeLabel title="วัตถุประสงค์ของโครงการ" />
              {renderList(
                draft.objectives,
                (idx, v) =>
                  setDraft((d) => {
                    const next = [...d.objectives];
                    next[idx] = { ...next[idx], description: v };
                    return { ...d, objectives: next };
                  }),
                () =>
                  setDraft((d) => ({
                    ...d,
                    objectives: [...d.objectives, { description: "" }],
                  })),
                (idx) =>
                  setDraft((d) => ({
                    ...d,
                    objectives: d.objectives.filter((_, i) => i !== idx),
                  })),
                "เพิ่มวัตถุประสงค์ของโครงการ"
              )}
            </div>

            <div>
              <BadgeLabel title="ผลที่คาดว่าจะได้รับ" />
              {renderList(
                draft.expectations,
                (idx, v) =>
                  setDraft((d) => {
                    const next = [...d.expectations];
                    next[idx] = { ...next[idx], description: v };
                    return { ...d, expectations: next };
                  }),
                () =>
                  setDraft((d) => ({
                    ...d,
                    expectations: [...d.expectations, { description: "" }],
                  })),
                (idx) =>
                  setDraft((d) => ({
                    ...d,
                    expectations: d.expectations.filter((_, i) => i !== idx),
                  })),
                "เพิ่มผลที่คาดว่าจะได้รับ"
              )}
            </div>
          </div>
        </div>
      )}
    </SectionShell>
  );
}
