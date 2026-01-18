"use client"

import { Eye, Clock } from "lucide-react"
import { useMemo, useState } from "react"

interface ApprovalQueueProps {
  approvals: Array<{
    project: string
    dept: string
    amount: string
    owner: string
    stage: string
    lastUpdate: string
    priority: "high" | "medium" | "low"
  }>
}

export function ApprovalQueue({ approvals }: ApprovalQueueProps) {
  /* ===============================
   * local filter (priority only)
   * =============================== */
  const [priority, setPriority] = useState<"all" | "high" | "medium" | "low">(
    "all"
  )

  /* ===============================
   * filter logic
   * =============================== */
  const filteredApprovals = useMemo(() => {
    return approvals.filter((item) => {
      if (priority !== "all" && item.priority !== priority) return false
      return true
    })
  }, [approvals, priority])

  const visibleApprovals = filteredApprovals.slice(0, 10)

  /* ===============================
   * render
   * =============================== */
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            คิวงานที่ต้องอนุมัติของฉัน
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            รายการรออนุมัติ {filteredApprovals.length} รายการ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* priority filter */}
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "all" | "high" | "medium" | "low")
            }
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
          >
            <option value="all">ทุกความเร่งด่วน</option>
            <option value="high">เร่งด่วน</option>
            <option value="medium">ปานกลาง</option>
            <option value="low">ปกติ</option>
          </select>

          {/* count */}
          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
            {filteredApprovals.length} รายการ
          </span>
        </div>
      </div>

      {/* list */}
      <div className="space-y-3 p-4 max-h-[640px] overflow-y-auto">
        {visibleApprovals.map((item, index) => (
          <div
            key={index}
            className="relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
          >
            {/* priority bar */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                item.priority === "high"
                  ? "bg-red-600"
                  : item.priority === "medium"
                  ? "bg-amber-500"
                  : "bg-gray-300"
              }`}
            />

            <div className="flex flex-col gap-3 pl-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 hover:text-blue-600">
                    {item.project}
                  </h4>
                  <span className="rounded-md border px-2 py-0.5 text-xs text-gray-700">
                    {item.dept}
                  </span>
                </div>

                <div className="flex gap-4 text-xs">
                  <span className="text-sm font-bold text-blue-600">
                    {item.amount}
                  </span>
                  <span className="text-gray-500">
                    โดย{" "}
                    <span className="font-medium text-gray-900">
                      {item.owner}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700">
                    {item.stage}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    {item.lastUpdate}
                  </div>
                </div>
              </div>

              <button className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-2 text-xs text-white shadow-sm hover:bg-gray-800">
                <Eye className="h-4 w-4" />
                ตรวจสอบ
              </button>
            </div>
          </div>
        ))}

        {filteredApprovals.length > 10 && (
          <div className="pt-2 text-center text-xs text-gray-500">
            และอีก {filteredApprovals.length - 10} รายการ
          </div>
        )}

        {filteredApprovals.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">
            ไม่พบรายการที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>
    </div>
  )
}
