"use client";
import * as React from "react";
import { BadgeCreateFormProject } from "../Helper";
import { GoalParams } from "@/dto/projectDto";

type Props = {
  value: GoalParams;
  onChange: (v: GoalParams) => void;
  locked?: boolean;
};

export default function GoalForm({ value, onChange, locked = false }: Props) {
  const update = (patch: Partial<GoalParams>) =>
    !locked && onChange({ ...value, ...patch });

  const cls = locked
    ? "min-h-[120px] w-full py-2 px-4 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 cursor-not-allowed"
    : "min-h-[120px] w-full py-2 px-4 rounded-lg border border-gray-300";

  return (
    <div className="space-y-4">
      <BadgeCreateFormProject title="เป้าหมายของโครงการ" />
       <h2 className="font-medium text-gray-800">เป้าหมายเชิงปริมาณ</h2>
      <textarea
        value={value.quantityGoal}
        onChange={(e) => update({ quantityGoal: e.target.value })}
        readOnly={locked}
        className={cls}
        placeholder="ระบุเป้าหมายเชิงปริมาณ เช่น จำนวนผู้เข้าร่วมอบรม 100 คน หรือผลิตภัณฑ์ที่ได้ 50 ชิ้น"
      />

      <h2 className="font-medium text-gray-800">เป้าหมายเชิงคุณภาพ</h2>
      <textarea
        value={value.qualityGoal}
        onChange={(e) => update({ qualityGoal: e.target.value })}
        readOnly={locked}
        className={cls}
        placeholder="ระบุเป้าหมายเชิงคุณภาพ เช่น ผู้เรียนมีทักษะเพิ่มขึ้น หรือสถานศึกษามีภาพลักษณ์ที่ดีขึ้น"
      />
    </div>
  );
}
