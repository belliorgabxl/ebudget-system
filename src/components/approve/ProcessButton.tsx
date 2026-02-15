"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { History } from "lucide-react";

interface Props {
  budget_plan_id: string;
}

export default function ProcessButton({ budget_plan_id }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/organizer/approve/process/${budget_plan_id}`);
      }}
      className="flex items-center cursor-pointer justify-end gap-2"
    >
      <p className="text-xs text-gray-700">สถานะการอนุมัติโครงการ</p>
      <History className="h-5 w-5 text-gray-700" />
    </button>
  );
}
