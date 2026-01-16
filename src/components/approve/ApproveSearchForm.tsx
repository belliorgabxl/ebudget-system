import React from "react";

type SearchFormParams = {
  q?: string;
  code?: string;
  plan_type?: string;
  page?: string;
  limit?: string;
};

type Props = {
  sp: SearchFormParams;
  defaultLimit?: number;
};

export default function ApprovalSearchForm({ sp, defaultLimit = 10 }: Props) {
  return (
    <form className="mb-4 rounded-xl border border-gray-200 shadow-md bg-white p-4">
      <div className="text-sm font-medium">ค้นหา</div>

      <div className="w-full grid gap-3 lg:gap-5 lg:flex justify-between">
        <div className="lg:flex grid gap-4 w-full">
          <div className="lg:flex grid items-center lg:gap-4 gap-2">
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              className=" w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring"
              placeholder="ชื่อโปรเจกต์ / หน่วยงาน / เจ้าของ..."
            />
          </div>

          <div className="flex items-center">
            <input
              name="code"
              defaultValue={sp.code ?? ""}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring"
              placeholder="รหัสโครงการ"
            />
          </div>

          <div className="flex items-center">
            <select
              className="w-full rounded-lg border border-gray-200 px-5 py-2 text-sm outline-none focus:ring"
              name="plan_type"
              defaultValue={sp.plan_type ?? ""}
            >
              <option value="">ทุกประเภท</option>
              <option value="regular_work">งานประจำ</option>
              <option value="project">โครงการ</option>
            </select>
          </div>

          <div className="flex items-center">
            <select
              name="limit"
              defaultValue={sp.limit ?? String(defaultLimit)}
              className="w-full rounded-lg border border-gray-200 px-5 py-2 text-sm outline-none focus:ring"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
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
