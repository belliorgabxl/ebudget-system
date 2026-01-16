"use client";

import Link from "next/link";
import { SquareArrowUp, CheckCircle, Clock, XCircle } from "lucide-react";
import { ClipboardClockIcon } from "@/components/icons/ClipboardClockIcon";
import { useRouter } from "next/navigation";
import { ProcessStep, ProcessTooltip } from "../details/ProgressDetail";

interface ApprovalStatusButtonProps {
  projectId: string;
  status: string;
  processSteps?: ProcessStep[];
}

export default function ApprovalStatusButton({
  projectId,
  status,
  processSteps,
}: ApprovalStatusButtonProps) {
  const router = useRouter();

  const onNavigationToProcess = (projectId: string) => {
    router.push(`/organizer/approve/${projectId}/process/`);
  };

  if (status === "draft") {
    return (
      <Link
        href={`/organizer/projects/approval/${projectId}`}
        className="rounded-md flex justify-center items-center gap-3
          bg-indigo-600 px-4 py-2 text-sm font-medium text-white
          hover:scale-[102%] hover:bg-indigo-700 transition"
      >
        <SquareArrowUp className="h-5 w-5" />
        ยื่นอนุมัติโครงการ
      </Link>
    );
  }

  if (status === "approved") {
    return (
      <div className="flex gap-1">
        <div
          className="rounded-md flex justify-center items-center gap-3
          bg-green-600 px-4 py-2 text-sm font-medium text-white cursor-default"
        >
          <CheckCircle className="h-5 w-5" />
          โครงการได้รับการอนุมัติแล้ว
        </div>
        <div className="relative group">
          <div
            onClick={() => {
              onNavigationToProcess(projectId);
            }}
            className="rounded-md bg-gradient-to-r from-emerald-500 to-sky-500 p-2 cursor-pointer"
          >
            <ClipboardClockIcon className="h-5 w-5 text-white" />
          </div>

          <div
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
                whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white
                opacity-0 transition-opacity duration-200
                group-hover:opacity-100"
          >
            กดเพื่อดูสถานะการอนุมัติ
          </div>
          {processSteps?.length ? (
            <div className="mt-16 pointer-events-none absolute -top-9 -left-20
             -translate-x-1/2
                whitespace-nowrap  px-3 py-1.5 text-xs text-white
                opacity-0 transition-opacity duration-200
                group-hover:opacity-100">
              <ProcessTooltip steps={processSteps} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (status === "pending_approval") {
    return (
      <div className="flex gap-1 ">
        <div
          className="rounded-md flex justify-center items-center gap-3
          bg-yellow-500 px-4  h-fit py-2 animate-pulse duration-1000 text-sm font-medium text-white cursor-wait"
        >
          <Clock className="h-5 w-5 animate-pulse" />
          กำลังรออนุมัติโครงการ...
        </div>
        <div className="relative group">
          <div
            onClick={() => {
              onNavigationToProcess(projectId);
            }}
            className="rounded-md bg-amber-500 p-2 cursor-pointer"
          >
            <ClipboardClockIcon className="h-5 w-5 text-white" />
          </div>

          <div
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
                whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white
                opacity-0 transition-opacity duration-200
                group-hover:opacity-100"
          >
            กดเพื่อดูสถานะการอนุมัติ
          </div>
           {processSteps?.length ? (
            <div className="mt-16 pointer-events-none absolute -top-9 -left-20
             -translate-x-1/2
                whitespace-nowrap  px-3 py-1.5 text-xs text-white
                opacity-0 transition-opacity duration-200
                group-hover:opacity-100">
              <ProcessTooltip steps={processSteps} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (status === "in_revision") {
    return (
      <div
        className="rounded-md flex justify-center items-center gap-3
          bg-red-600 px-4 py-2 text-sm font-medium text-white cursor-default"
      >
        <XCircle className="h-5 w-5" />
        โครงการถูกปฏิเสธ
      </div>
    );
  }

  return null;
}
