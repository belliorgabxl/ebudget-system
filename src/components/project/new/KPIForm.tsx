"use client";
import * as React from "react";
import { BadgeCreateFormProject } from "../Helper";
import { KPIParams } from "@/dto/projectDto";

type Props = {
  value: KPIParams;
  onChange: (v: KPIParams) => void;
  locked?: boolean;
};

export default function KPIForm({ value, onChange, locked = false }: Props) {
  const update = (patch: Partial<KPIParams>) =>
    !locked && onChange({ ...value, ...patch });

  const cls = locked
    ? "min-h-[120px] w-full py-2 px-4 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 cursor-not-allowed"
    : "min-h-[120px] w-full py-2 px-4 rounded-lg border border-gray-300";

  return (
    <div className="space-y-4">
      <BadgeCreateFormProject title="ตัวชี้วัดความสำเร็จของโครงการ (KPIs)" />

      <h2 className="font-medium text-gray-800">
        ตัวชี้วัดผลผลิต (Output Indicators)
      </h2>
      <textarea
        value={value.output}
        onChange={(e) => update({ output: e.target.value })}
        readOnly={locked}
        className={cls}
        placeholder="ระบุตัวชี้วัดผลผลิต เช่น จำนวนกิจกรรมที่ดำเนินการได้ตามแผน / ผู้เข้าร่วมอบรมครบ 100 คน"
      />

      <h2 className="font-medium text-gray-800">
        ตัวชี้วัดผลลัพธ์ (Outcome Indicators)
      </h2>
      <textarea
        value={value.outcome}
        onChange={(e) => update({ outcome: e.target.value })}
        readOnly={locked}
        className={cls}
        placeholder="ระบุตัวชี้วัดผลลัพธ์ เช่น ผู้เรียนมีความรู้เพิ่มขึ้น / หน่วยงานได้รับการยอมรับมากขึ้น"
      />
    </div>
  );
}
