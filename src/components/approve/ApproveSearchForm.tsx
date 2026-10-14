"use client";

import React, { useRef, useState } from "react";

type SearchFormParams = {
  q?: string;
  code?: string;
  plan_type?: string;
  department_id?: string;
  page?: string;
  limit?: string;
};

export type DepartmentOption = { id: string; name: string };
export type ProjectCodeOption = { code: string; name: string; department_id: string };

type Props = {
  sp: SearchFormParams;
  defaultLimit?: number;
  departmentOptions?: DepartmentOption[];
  projectOptions?: ProjectCodeOption[];
};

const selectClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring";

export default function ApprovalSearchForm({
  sp,
  defaultLimit = 10,
  departmentOptions = [],
  projectOptions = [],
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [departmentId, setDepartmentId] = useState(sp.department_id ?? "");
  const [code, setCode] = useState(sp.code ?? "");

  // Narrow the project list to the chosen department so users can't pick a mismatched pair
  const visibleProjects = departmentId
    ? projectOptions.filter((p) => p.department_id === departmentId)
    : projectOptions;

  // Choosing from a dropdown searches immediately — no need to type or press the button
  const submitSoon = () => requestAnimationFrame(() => formRef.current?.requestSubmit());

  const handleDepartmentChange = (value: string) => {
    setDepartmentId(value);
    if (code && value && !projectOptions.some((p) => p.code === code && p.department_id === value)) {
      setCode("");
    }
    submitSoon();
  };

  return (
    <form ref={formRef} className="mb-4 rounded-xl border border-gray-200 shadow-md bg-white p-4">
      <div className="text-sm font-medium mb-2">ค้นหา</div>

      <div className="w-full grid gap-3 lg:gap-5 lg:flex justify-between">
        <div className="grid gap-3 w-full sm:grid-cols-2 lg:grid-cols-[1.2fr_1.6fr_1fr_0.9fr_0.6fr]">
          <select
            name="department_id"
            aria-label="ฝ่าย / หน่วยงาน"
            value={departmentId}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className={selectClass}
          >
            <option value="">ทุกฝ่าย / หน่วยงาน</option>
            {departmentOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            name="code"
            aria-label="รหัสโครงการ"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              submitSoon();
            }}
            className={selectClass}
          >
            <option value="">ทุกโครงการ ({visibleProjects.length})</option>
            {visibleProjects.map((p) => (
              <option key={p.code} value={p.code}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>

          <input
            name="q"
            defaultValue={sp.q ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring"
            placeholder="ค้นหาชื่อโครงการ..."
          />

          <select
            name="plan_type"
            aria-label="ประเภท"
            defaultValue={sp.plan_type ?? ""}
            onChange={submitSoon}
            className={selectClass}
          >
            <option value="">ทุกประเภท</option>
            <option value="regular_work">งานประจำ</option>
            <option value="project">โครงการ</option>
          </select>

          <select
            name="limit"
            aria-label="จำนวนต่อหน้า"
            defaultValue={sp.limit ?? String(defaultLimit)}
            onChange={submitSoon}
            className={selectClass}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>

          <input type="hidden" name="page" value="1" />
        </div>

        <button
          type="submit"
          className="lg:w-40 h-fit w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-blue-800
          hover:to-blue-800 hover:scale-[102%] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          ค้นหา
        </button>
      </div>
    </form>
  );
}
