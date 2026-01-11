"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell } from "./SectionShell";
import {
  BadgeLabel,
  EmptyRow,
  Field,
  Grid2,
  formatBaht,
  moneyOrDash,
} from "@/components/project/Helper";
import { Th } from "@/components/approve/Helper";
import { Td } from "@/components/project/Helper";
import { BUDGET_SOURCE_LABEL, BudgetSourceType } from "@/constants/project";
import { normalizeBudgetSourceLabel, toBudgetSourceType } from "@/lib/helper";
import { BudgetSectionDraft } from "@/dto/sectionupdate";

type BudgetItemDraft = {
  id: number;
  name: string;
  amount: string;
  remark: string;
};

type Props = {
  projectId: string;
  budget: {
    total: number;
    rows: { id: number; name: string; amount: string; remark: string }[];
    sources?: { source?: string; externalAgency?: string };
  } | null;

  canEdit: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;

  onSave: (
    draft: BudgetSectionDraft,
    computedTotal: number
  ) => Promise<void> | void;
};

const toNumber = (v: string) => {
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export function BudgetSection({
  projectId,
  budget,
  canEdit,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: Props) {
  const originalDraft: BudgetSectionDraft = useMemo(() => {
    const rows = budget?.rows ?? [];
    return {
      project_id: projectId,
      budget_source: toBudgetSourceType(budget?.sources?.source ?? "revenue"),
      budget_source_department: budget?.sources?.externalAgency ?? "",
      budget_items: rows.map((r, idx) => ({
        id: Number(r.id ?? idx + 1),
        name: r.name ?? "",
        amount: String(r.amount ?? ""),
        remark: r.remark ?? "",
      })),
      budget_amount: 0,
    };
  }, [budget, projectId]);

  const [draft, setDraft] = useState<BudgetSectionDraft>(originalDraft);

  useEffect(() => {
    if (isEditing) setDraft(originalDraft);
  }, [isEditing, originalDraft]);

  const disabledClass = !canEdit ? "opacity-60 pointer-events-none" : "";

  const computedTotal = useMemo(() => {
    return (draft.budget_items ?? []).reduce(
      (sum, it) => sum + toNumber(it.amount),
      0
    );
  }, [draft.budget_items]);

  const addRow = () => {
    setDraft((d) => {
      const nextId =
        (d.budget_items?.reduce((m, x) => Math.max(m, x.id), 0) ?? 0) + 1;
      return {
        ...d,
        budget_items: [
          ...(d.budget_items ?? []),
          { id: nextId, name: "", amount: "", remark: "" },
        ],
      };
    });
  };

  const removeRow = (id: number) => {
    setDraft((d) => ({
      ...d,
      budget_items: (d.budget_items ?? []).filter((x) => x.id !== id),
    }));
  };

  const updateItem = (id: number, patch: Partial<BudgetItemDraft>) => {
    setDraft((d) => ({
      ...d,
      budget_items: (d.budget_items ?? []).map((x) =>
        x.id === id ? { ...x, ...patch } : x
      ),
    }));
  };

  return (
    <SectionShell
      title="งบประมาณ"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={() => canEdit && onEdit()}
      onCancel={() => {
        setDraft(originalDraft);
        onCancel();
      }}
      onSave={() => onSave({ ...draft, project_id: projectId }, computedTotal)}
    >
      {!isEditing ? (
        !budget ? (
          <EmptyRow>ยังไม่มีการบันทึกงบประมาณ</EmptyRow>
        ) : (
          <div className="space-y-4">
            <Grid2>
              <Field
                label="แหล่งงบประมาณ"
                value={
                  normalizeBudgetSourceLabel(budget.sources?.source) || "—"
                }
              />
              <Field
                label="หน่วยงาน"
                value={budget.sources?.externalAgency || "—"}
              />
              <Field label="งบประมาณรวม" value={formatBaht(budget.total)} />
            </Grid2>

            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-700">
                    <Th className="font-semibold w-16">#</Th>
                    <Th className="font-semibold">รายการ</Th>
                    <Th className="text-right font-semibold w-40">จำนวนเงิน</Th>
                    <Th className="font-semibold">หมายเหตุ</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {budget.rows?.length ? (
                    budget.rows.map((r) => (
                      <tr key={r.id}>
                        <Td className="px-3 py-2 text-center">{r.id}</Td>
                        <Td className="px-3 py-2">{r.name || "—"}</Td>
                        <Td className="px-3 py-2 text-right">
                          {moneyOrDash(r.amount)}
                        </Td>
                        <Td className="px-3 py-2">{r.remark || "—"}</Td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-3 text-center text-gray-500"
                      >
                        ยังไม่มีรายการงบประมาณ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className={disabledClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <label className="space-y-1">
              <BadgeLabel title="แหล่งงบประมาณ" />
              <div className="flex flex-wrap items-center gap-6 text-sm">
                {(Object.keys(BUDGET_SOURCE_LABEL) as BudgetSourceType[]).map(
                  (key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="budget_source"
                        value={key}
                        checked={draft.budget_source === key}
                        onChange={() =>
                          setDraft((d) => ({
                            ...d,
                            budget_source: key,
                            budget_source_department:
                              key === "external"
                                ? d.budget_source_department
                                : "",
                          }))
                        }
                        className="accent-indigo-600"
                      />
                      <span>{BUDGET_SOURCE_LABEL[key]}</span>
                    </label>
                  )
                )}
              </div>
            </label>

            <label className="space-y-1">
              <BadgeLabel title="หน่วยงาน (ถ้ามี)" />
              <input
                value={draft.budget_source_department ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    budget_source_department: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="เช่น หน่วยงานภายนอก"
              />
            </label>

            <div className="md:col-span-2">
              <BadgeLabel title="งบประมาณรวม (คำนวณอัตโนมัติ)" />
              <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold">
                {formatBaht(computedTotal)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">
              รายการงบประมาณ
            </div>
            <button
              type="button"
              onClick={addRow}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              + เพิ่มรายการ
            </button>
          </div>

          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <Th className="w-16">#</Th>
                  <Th>รายการ</Th>
                  <Th className="w-40 text-right">จำนวนเงิน</Th>
                  <Th>หมายเหตุ</Th>
                  <Th className="w-20">
                    <div></div>
                  </Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {draft.budget_items?.length ? (
                  draft.budget_items.map((it, idx) => (
                    <tr key={it.id}>
                      <Td className="px-3 py-2 text-center">{idx + 1}</Td>

                      <Td className="px-3 py-2">
                        <input
                          value={it.name ?? ""}
                          onChange={(e) =>
                            updateItem(it.id, { name: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          placeholder="เช่น ค่าวัสดุอุปกรณ์"
                        />
                      </Td>

                      <Td className="px-3 py-2">
                        <input
                          inputMode="decimal"
                          value={it.amount ?? ""}
                          onChange={(e) =>
                            updateItem(it.id, { amount: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-right"
                          placeholder="0.00"
                        />
                      </Td>

                      <Td className="px-3 py-2">
                        <input
                          value={it.remark ?? ""}
                          onChange={(e) =>
                            updateItem(it.id, { remark: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          placeholder="หมายเหตุ"
                        />
                      </Td>

                      <Td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(it.id)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                        >
                          ลบ
                        </button>
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-3 text-center text-gray-500"
                    >
                      ยังไม่มีรายการงบประมาณ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SectionShell>
  );
}
