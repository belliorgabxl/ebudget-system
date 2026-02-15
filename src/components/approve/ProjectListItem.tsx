"use client";

import React from "react";
import Link from "next/link";
import ProcessButton from "./ProcessButton";

type ProjectItemProps = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  budget_plan_id?: string | null;
  statusLabel: string;
  statusClass: string;
  canAccess: boolean;
};

function truncateText(text?: string | null, max = 100) {
  if (!text) return "—";
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

export default function ProjectListItem({
  id,
  name,
  code,
  description,
  start_date,
  end_date,
  budget_plan_id,
  statusLabel,
  statusClass,
  canAccess,
}: ProjectItemProps) {
  return (
    <Link
      href={canAccess ? `/organizer/approve/${id}/project-detail` : "#"}
      onClick={(e) => {
        if (!canAccess) {
          e.preventDefault();
        }
      }}
      className={`flex flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between ${
        canAccess ? "" : "opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="min-w-0">
        <div className="truncate flex items-center gap-4 text-sm text-gray-700 font-medium">
          <p className="text-green-600">ชื่อโครงการ</p> {name}
        </div>

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {code ? (
            <span className="flex gap-3 items-center">
              <p className="font-semibold">รหัส:</p> {code}
            </span>
          ) : null}
          |
          <span className="flex gap-3 items-center">
            <p className="font-semibold line-clamp-1">รายละเอียด:</p>{" "}
            <p className="lg:block hidden">
              {truncateText(description, 150)}
            </p>
            <p className="lg:hidden block">{truncateText(description, 45)}</p>
          </span>
        </div>

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {start_date ? (
            <span className="flex gap-3 items-center">
              <p className="font-semibold">เริ่ม:</p> {start_date}
            </span>
          ) : null}
          {end_date ? (
            <span className="flex gap-3 items-center">
              <p className="font-semibold">สิ้นสุด:</p> {end_date}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-rows-2 z-10 h-full gap-2 place-items-end">
        <ProcessButton budget_plan_id={budget_plan_id ?? ""} />
        <span
          className={`h-fit rounded-lg border px-3 py-2 text-xs font-medium cursor-text ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>
    </Link>
  );
}
