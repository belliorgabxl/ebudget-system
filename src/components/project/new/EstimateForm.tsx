"use client";

import * as React from "react";
import { BadgeCreateFormProject } from "../Helper";
import { EstimateParams } from "@/dto/projectDto";
import { GetAllUsers } from "@/api/users";
import { GetUserRespond } from "@/dto/userDto";

type Props = {
  value?: EstimateParams;
  onChange: (params: EstimateParams) => void;
};

export default function EstimateForm({ value, onChange }: Props) {
  const [estimateType, setEstimateType] = React.useState(
    value?.estimateType ?? ""
  );

  const [evaluator, setEvaluator] = React.useState(value?.evaluator ?? "");

  const [startDate, setStartDate] = React.useState(value?.startDate ?? "");
  const [endDate, setEndDate] = React.useState(value?.endDate ?? "");

  const [users, setUsers] = React.useState<GetUserRespond[]>([]);

  React.useEffect(() => {
    onChange({
      estimateType,
      evaluator,
      startDate,
      endDate,
    });
  }, [estimateType, evaluator, startDate, endDate, onChange]);

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const items = await GetAllUsers();
        setUsers(items);
      } catch (err) {
        console.error("Load users failed:", err);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="space-y-4">
      <BadgeCreateFormProject title="การติดตามและประเมินผล" />
      <div className="grid lg:flex flex-wrap gap-4 pb-4">
        <span className="font-medium">วิธีการประเมินผล</span>

        <div className="grid gap-4 lg:flex">
          {["แบบสอบถาม", "สัมภาษณ์", "สังเกตพฤติกรรม", "รายงานผล"].map((m) => (
            <label key={m} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={estimateType === m}
                onChange={() => setEstimateType(m)}
                className="h-4 w-4"
              />
              <span>{m}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="lg:flex grid gap-4 pb-4">
        <label className="font-medium">ผู้รับผิดชอบการประเมินผล</label>

        <select
          value={evaluator}
          onChange={(e) => setEvaluator(e.target.value)}
          className="ml-2 w-80 border-b border-gray-400 focus:outline-none bg-white"
        >
          <option value="">เลือกผู้รับผิดชอบ</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name || u.username}
            </option>
          ))}
        </select>
      </div>

      <div className="grid lg:flex gap-4">
        <label className="font-medium">ระยะเวลาการประเมินผล</label>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-b border-gray-400 focus:outline-none"
          />
          <span>-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-b border-gray-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
