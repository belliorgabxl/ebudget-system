"use client";

import * as React from "react";
import { BadgeCreateFormProject } from "../Helper";
import { ObjectiveParams } from "@/dto/projectDto";
import { Trash } from "lucide-react";

type Props = {
  value: ObjectiveParams;
  onChange: (v: ObjectiveParams) => void;
  locked?: boolean;
};

export default function ObjectiveForm({ value, onChange, locked = false }: Props) {
  const update = (idx: number, text: string) => {
    if (locked) return;
    const clone = [...value.results];
    clone[idx] = {
      ...clone[idx],
      description: text,
      type: clone[idx].type ?? "objective",
    };
    onChange({ results: clone });
  };

  const addRow = () => {
    if (locked) return;
    onChange({
      results: [
        ...value.results,
        {
          description: "",
          type: "objective",
        },
      ],
    });
  };

  const removeRow = (idx: number) => {
    if (locked) return;
    const clone = value.results.filter((_, i) => i !== idx);
    onChange({ results: clone });
  };

  const textareaCls = locked
    ? "min-h-[120px] w-full rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 py-2 px-4 cursor-not-allowed"
    : "min-h-[120px] w-full rounded-lg border border-gray-300 py-2 px-4";

  return (
    <div className="space-y-4">
      <BadgeCreateFormProject title="วัตถุประสงค์ของโครงการ" />
      <h2 className="font-medium text-gray-800">วัตถุประสงค์ของโครงการ</h2>

      <div className="space-y-4">
        {value.results.map((item, idx) => (
          <div key={idx} className="relative">
            <textarea
              value={item.description}
              onChange={(e) => update(idx, e.target.value)}
              readOnly={locked}
              className={textareaCls}
              placeholder={`วัตถุประสงค์ข้อที่ ${idx + 1}`}
            />

            {value.results.length > 1 && !locked && (
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="absolute -top-2 -right-2 rounded-full bg-red-400 text-white p-2 hover:bg-red-600 flex items-center justify-center"
              >
                <Trash className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {!locked && (
        <button
          type="button"
          onClick={addRow}
          className="rounded-md px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          + เพิ่มวัตถุประสงค์ของโครงการ
        </button>
        )}
      </div>
    </div>
  );
}
