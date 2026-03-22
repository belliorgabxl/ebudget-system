"use client";
import * as React from "react";
import { BadgeCreateFormProject } from "../Helper";
import { Department, GeneralInfoCreateParams } from "@/dto/projectDto";
import { fetchDepartments } from "@/api/department";
import { GetUserRespond } from "@/dto/userDto";
import { GetAllUsers } from "@/api/users";

type LockedField = "name" | "type" | "description" | "owner_user_id" | "department_id";

type Props = {
  value?: GeneralInfoCreateParams;
  onChange: (params: GeneralInfoCreateParams) => void;
  lockedFields?: LockedField[];
};

export default function GeneralInfoTable({ value, onChange, lockedFields = [] }: Props) {
  const isLocked = (field: LockedField) => lockedFields.includes(field);

  // Only fetch-data lists kept as internal state — all form values come from parent
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [users, setUsers] = React.useState<GetUserRespond[]>([]);

  React.useEffect(() => {
    fetchDepartments().then(setDepartments).catch(console.error);
  }, []);

  React.useEffect(() => {
    GetAllUsers().then(setUsers).catch(console.error);
  }, []);

  const set = (field: keyof GeneralInfoCreateParams, val: string) => {
    onChange({ ...(value ?? { name: "", type: "", department_id: "", owner_user_id: "", description: "" }), [field]: val });
  };

  const name = value?.name ?? "";
  const type = value?.type ?? "";
  const department_id = value?.department_id ?? "";
  const owner_user_id = value?.owner_user_id ?? "";
  const description = value?.description ?? "";

  return (
    <div className="space-y-4">
      <BadgeCreateFormProject title="ข้อมูลพื้นฐาน" />

      <div className="grid gap-4">
        <div className="lg:flex grid gap-3 items-center">
          <label className="text-sm text-gray-700 min-w-[180px]">
            ชื่อแผนการ / โครงการ
          </label>
          <div className="relative w-full">
            <input
              value={name}
              onChange={(e) => !isLocked("name") && set("name", e.target.value)}
              readOnly={isLocked("name")}
              className={`px-4 py-1 border rounded-lg w-full ${
                isLocked("name")
                  ? "border-indigo-200 bg-indigo-50 text-indigo-800 cursor-not-allowed"
                  : "border-gray-300"
              }`}
              placeholder="ระบุชื่อโครงการ"
            />
            {isLocked("name") && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-medium">
                จากแผนงานประจำ
              </span>
            )}
          </div>
        </div>

        <div className="lg:flex grid gap-3 items-center">
          <label className="text-sm text-gray-700 min-w-[180px]">
            ประเภทโครงการ
          </label>
          <select
            value={type}
            onChange={(e) => !isLocked("type") && set("type", e.target.value)}
            disabled={isLocked("type")}
            className={`px-4 py-1 border rounded-lg w-full ${
              isLocked("type")
                ? "border-indigo-200 bg-indigo-50 text-indigo-800 cursor-not-allowed"
                : "border-gray-300"
            }`}
          >
            <option value="">เลือกประเภท</option>
            <option value="project">ทั่วไป</option>
            <option value="regular_work">แผนงานประจำ</option>
            <option value="special_project">โครงการพิเศษ / พัฒนา</option>
          </select>
        </div>

        <div className="lg:flex grid gap-3 items-center">
          <label className="text-sm text-gray-700 min-w-[180px]">
            หน่วยงาน / แผนกที่รับผิดชอบ
          </label>
          <div className="relative w-full">
            <select
              value={department_id}
              onChange={(e) => !isLocked("department_id") && set("department_id", e.target.value)}
              disabled={isLocked("department_id")}
              className={`px-4 py-1 border rounded-lg w-full ${
                isLocked("department_id")
                  ? "border-indigo-200 bg-indigo-50 text-indigo-800 cursor-not-allowed"
                  : "border-gray-300"
              }`}
            >
              <option value="">เลือกหน่วยงาน / แผนก</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {isLocked("department_id") && (
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-medium pointer-events-none">
                จากบัญชีของคุณ
              </span>
            )}
          </div>
        </div>

        <div className="lg:flex grid gap-3 items-center">
          <label className="text-sm text-gray-700 min-w-[180px]">
            ผู้รับผิดชอบโครงการ
          </label>
          <div className="relative w-full">
            <select
              value={owner_user_id}
              onChange={(e) => !isLocked("owner_user_id") && set("owner_user_id", e.target.value)}
              disabled={isLocked("owner_user_id")}
              className={`px-4 py-1 border rounded-lg w-full ${
                isLocked("owner_user_id")
                  ? "border-indigo-200 bg-indigo-50 text-indigo-800 cursor-not-allowed"
                  : "border-gray-300"
              }`}
            >
              <option value="">เลือกผู้รับผิดชอบ</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
            {isLocked("owner_user_id") && (
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-medium pointer-events-none">
                จากบัญชีของคุณ
              </span>
            )}
          </div>
        </div>

        <div className="lg:flex grid gap-3 items-center">
          <label className="text-sm text-gray-700 min-w-[180px]">
            อธิบายรายละเอียดของโครงการ
          </label>
          <div className="relative w-full">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => !isLocked("description") && set("description", e.target.value)}
              readOnly={isLocked("description")}
              className={`px-4 py-1 border rounded-lg w-full ${
                isLocked("description")
                  ? "border-indigo-200 bg-indigo-50 text-indigo-800 cursor-not-allowed"
                  : "border-gray-300"
              }`}
              placeholder="ระบุรายละเอียดโครงการ"
            />
            {isLocked("description") && (
              <span className="absolute right-3 top-2 text-[10px] text-indigo-400 font-medium">
                จากแผนงานประจำ
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
