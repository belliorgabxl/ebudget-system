"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { formatCompactNumber } from "@/lib/util"

interface BudgetByDeptChartProps {
  data: {
    department: string
    budget: number
    actual: number
  }[]
}

export function BudgetByDeptChart({ data }: BudgetByDeptChartProps) {

  return (
    <div className="rounded-xl bg-white shadow-sm p-6">
      <h3 className="mb-1 text-base font-semibold">
        เงินที่ใช้ในโครงการต่อหน่วยงาน
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        แสดงงบประมาณที่จัดสรรให้แต่ละหน่วยงาน
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          barSize={32}
          barCategoryGap="35%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="department" />
          <YAxis tickFormatter={(value) => formatCompactNumber(value)} />
          <Tooltip
            formatter={(v: number) => [`฿${formatCompactNumber(v)}`, "งบประมาณ"]}
            labelFormatter={(label) => `หน่วยงาน: ${label}`}
          />

          <Bar
            dataKey="budget"
            name="งบประมาณ"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex justify-center text-sm text-foreground">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-[#10b981]" />
          <span>งบประมาณ</span>
        </div>
      </div>
    </div>
  )
}
