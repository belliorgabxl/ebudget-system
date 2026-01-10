"use client";
import { useState, useEffect } from "react";
import { BadgeCreateFormProject } from "../Helper";
import { Department, GeneralInfoParams } from "@/dto/projectDto";
import { fetchDepartments } from "@/api/department";
import { User } from "@/dto/userDto";
import { GetAllUsers } from "@/api/users";

type Props = {
  value?: GeneralInfoParams;
  onChange: (params: GeneralInfoParams) => void;
};

export default function GeneralInfoTable({ value, onChange }: Props) {
  const [name, setName] = useState(value?.name ?? "");
  const [type, setType] = useState(value?.type ?? "");
  const [department_id, setDepartment] = useState(value?.department_id ?? "");
  const [owner_user_id, setOwner] = useState(value?.owner_user_id ?? "");
  const [description, setDescription] = useState<string>(
    value?.description ?? ""
  );

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const items = await fetchDepartments();
        setDepartments(items);
      } catch (err) {
        console.error("load departments failed", err);
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    onChange({
      name,
      type,
      department_id: department_id,
      owner_user_id: owner_user_id,
      description: description,
    });
  }, [name, type, department_id, owner_user_id, description, onChange]);

  return (
    <div className="space-y-4">
      <BadgeCreateFormProject title="ข้อมูลพื้นฐาน" />

      <div className="grid gap-4">
        <div className="lg:flex grid gap-3 items-center">
          <label className="text-sm text-gray-700 min-w-[180px]">
            ชื่อแผนการ / โครงการ
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-1 border rounded-lg border-gray-300 w-full"
            placeholder="ระบุชื่อโครงการ"
          />
        </div>
        <div className="lg:flex grid gap-3 items-center">
          <label className="text-sm text-gray-700 min-w-[180px]">
            ประเภทโครงการ
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-1 border rounded-lg border-gray-300 w-full"
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
          <select
            value={department_id}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-4 py-1 border rounded-lg border-gray-300 w-full"
          >
            <option value="">เลือกหน่วยงาน / แผนก</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:flex grid gap-3 items-center">
          <label className="text-sm text-gray-700 min-w-[180px]">
            ผู้รับผิดชอบโครงการ
          </label>

          <select
            value={owner_user_id}
            onChange={(e) => setOwner(e.target.value)}
            className="px-4 py-1 border rounded-lg border-gray-300 w-full"
          >
            <option value="">เลือกผู้รับผิดชอบ</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:flex grid gap-3 items-center">
          <label className="text-sm text-gray-700 min-w-[180px]">
            อธิบายรายละเอียดของโครงการ
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-4 py-1 border rounded-lg border-gray-300 w-full"
            placeholder="ระบุชื่อโครงการ"
          />
        </div>
      </div>
    </div>
  );
}
