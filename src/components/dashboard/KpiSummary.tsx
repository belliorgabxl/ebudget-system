"use client"

import { TrendingUp, Folder, DollarSign } from "lucide-react"
import { formatCompactNumber } from "@/lib/util"

interface KpiSummaryProps {
  totalBudget: number
  totalProjects: number
  avgBudget: number
}

export function KpiSummary({
  totalBudget,
  totalProjects,
  avgBudget,
}: KpiSummaryProps) {
  return (
    <div
      className="
        flex
        flex-col
        gap-6
        sm:flex-row
      "
    >
      {/* ===== KPI: Budget ===== */}
      <div className="flex-1 rounded-xl shadow-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-sm text-muted-foreground">งบประมาณรวม</span>
        </div>

        <div className="mt-4 text-3xl font-bold">
          ฿{formatCompactNumber(totalBudget)}
        </div>
      </div>

      {/* ===== KPI: Projects ===== */}
  <div className="flex-1 rounded-xl shadow-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2">
            <Folder className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="text-sm text-muted-foreground">จำนวนโครงการ</span>
        </div>

        <div className="mt-4 text-3xl font-bold">
          {totalProjects}
        </div>
      </div>

      {/* ===== KPI: Avg ===== */}
     <div className="flex-1 rounded-xl shadow-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-100 p-2">
            <TrendingUp className="h-5 w-5 text-violet-600" />
          </div>
          <span className="text-sm text-muted-foreground">
            งบเฉลี่ย / โครงการ
          </span>
        </div>

     <div className="mt-4 text-3xl font-bold">
      ฿{formatCompactNumber(avgBudget ?? 0)}
</div>
      </div>
    </div>
  )
}
