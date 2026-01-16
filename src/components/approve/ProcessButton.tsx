"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { History } from "lucide-react";

interface Props {
  project_id: string;
}

export default function ProcessButton({ project_id }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/organizer/approve/${project_id}/process`);
      }}
      className="flex items-center cursor-pointer justify-end gap-2"
    >
      <p className="text-xs text-gray-700">สถานะการอนุมัติโครงการ</p>
      <History className="h-5 w-5 text-gray-700" />
    </button>
  );
}
