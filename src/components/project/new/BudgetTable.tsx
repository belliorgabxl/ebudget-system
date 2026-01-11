"use client";
import { useEffect, useMemo, useState } from "react";
import { BadgeCreateFormProject } from "../Helper";
import { BudgetItems, BudgetTableValue, FundingSources } from "@/dto/projectDto";

export function BudgetTable({
  value,
  onChange,
}: {
  value?: BudgetTableValue;
  onChange: (v: BudgetTableValue) => void;
}) {
  const [rows, setRows] = useState<BudgetItems[]>(
    value?.rows ?? [{ id: 1, name: "", amount: "", remark: "" }]
  );

  const [sources, setSources] = useState<FundingSources>(
    value?.sources ?? {
      source: "",
      externalAgency: "",
    }
  );

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
    [rows]
  );

  useEffect(() => {
    onChange({ rows, total, sources });
  }, [rows, sources, total, onChange]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: prev.length + 1, name: "", amount: "", remark: "" },
    ]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.map((r, idx) => ({ ...r, id: idx + 1 }));
    });
  };

  const updateRow = (idx: number, field: keyof BudgetItems, value: string) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="space-y-4">
      <BadgeCreateFormProject title="งบประมาณ" />
      <div className="flex flex-col lg:gap-2 gap-4">
        <div className="grid lg:flex lg:gap-2 gap-3">
          <label className="font-medium">งบประมาณทั้งหมด</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              readOnly
              value={fmt(total)}
              className="ml-2 w-40 border-b border-gray-400 focus:outline-none text-center bg-gray-50 cursor-not-allowed select-none"
              aria-readonly="true"
              title="คำนวณจากตารางด้านล่างโดยอัตโนมัติ"
            />
            บาท
          </div>
        </div>

        <div className="grid lg:flex items-center flex-wrap gap-4">
          <span className="font-medium">แหล่งงบประมาณ</span>

          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="funding-source"
              className="h-4 w-4"
              checked={sources.source === "school"}
              onChange={() =>
                setSources((s) => ({
                  ...s,
                  source: "school",
                  externalAgency:
                    s.source === "external" ? "" : s.externalAgency,
                }))
              }
            />
            <span>งบสถานศึกษา</span>
          </label>

          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="funding-source"
              className="h-4 w-4"
              checked={sources.source === "revenue"}
              onChange={() =>
                setSources((s) => ({
                  ...s,
                  source: "revenue",
                  externalAgency:
                    s.source === "external" ? "" : s.externalAgency,
                }))
              }
            />
            <span>เงินรายได้</span>
          </label>

          <label className="grid lg:flex items-center gap-1">
            <div className="flex gap-2 items-center">
              <input
                type="radio"
                name="funding-source"
                className="h-4 w-4"
                checked={sources.source === "external"}
                onChange={() =>
                  setSources((s) => ({
                    ...s,
                    source: "external",
                  }))
                }
              />
              <span>ภายนอก (ระบุหน่วยงาน)</span>
            </div>

            <input
              type="text"
              placeholder="เช่น กระทรวงศึกษา"
              value={sources.externalAgency}
              onChange={(e) =>
                setSources((s) => ({ ...s, externalAgency: e.target.value }))
              }
              disabled={sources.source !== "external"}
              className="ml-2 w-56 border-b border-gray-400 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100 lg:text-base text-sm">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-center w-1/2">
                  รายการ
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center w-1/4">
                  จำนวนเงิน (บาท)
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center w-1/4">
                  หมายเหตุ
                </th>
                <th className="border border-gray-300 px-2 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(idx, "name", e.target.value)}
                      placeholder={`ระบุรายการ (ลำดับ ${row.id})`}
                      className="w-full focus:outline-none"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="1"
                      value={row.amount}
                      onChange={(e) => updateRow(idx, "amount", e.target.value)}
                      placeholder="0.00"
                      className="w-28 text-center focus:outline-none"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={row.remark}
                      onChange={(e) => updateRow(idx, "remark", e.target.value)}
                      placeholder="หมายเหตุ"
                      className="w-full focus:outline-none"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="px-2 py-1 rounded-md text-red-600 hover:bg-red-50"
                      disabled={rows.length === 1}
                      title={
                        rows.length === 1 ? "ต้องมีอย่างน้อย 1 แถว" : "ลบแถวนี้"
                      }
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50 text-right">
                  รวม
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center font-semibold bg-gray-50">
                  {fmt(total)}
                </td>
                <td
                  className="border border-gray-300 px-4 py-2 bg-gray-50"
                  colSpan={2}
                ></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">แถวทั้งหมด: {rows.length}</div>
          <button
            type="button"
            onClick={addRow}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            + เพิ่มรายการ
          </button>
        </div>
      </div>
    </div>
  );
}
