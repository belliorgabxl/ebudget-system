"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts"
import { formatCompactNumber } from "@/lib/util"

interface BudgetByStatusChartProps {
  data: {
    status: string
    budget: number
  }[]
}

const COLORS: Record<string, string> = {
  "ร่าง": "#94a3b8",
  "แก้ไข": "#f59e0b",
  "รออนุมัติ": "#3b82f6",
  "อนุมัติแล้ว": "#10b981",
}

const STATUS_ORDER = ["ร่าง", "แก้ไข", "รออนุมัติ", "อนุมัติแล้ว"]

export function BudgetByStatusChart({ data }: BudgetByStatusChartProps) {
  // Sort data by status order
  const sortedData = [...data].sort((a, b) => {
    const indexA = STATUS_ORDER.indexOf(a.status)
    const indexB = STATUS_ORDER.indexOf(b.status)
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
  })

  return (
     <div className="rounded-xl bg-white shadow-sm p-6">
      <h3 className="mb-1 text-base font-semibold">
        เงินที่ใช้ในโครงการตามสถานะ
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        แสดงงบประมาณแยกตามสถานะโครงการ
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={sortedData}
          barSize={44}
          barCategoryGap="40%"
        >
          {/* Grid บาง ๆ */}
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="status"
      
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatCompactNumber(value)}
          />

          <Tooltip
            formatter={(v: number) => [`฿${formatCompactNumber(v)}`, "งบประมาณ"]}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: 12,
            }}
          />

          <Bar
            dataKey="budget"
            radius={[8, 8, 0, 0]}
          >
            {sortedData.map((d, i) => (
              <Cell
                key={i}
                fill={COLORS[d.status] ?? "#9ca3af"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend แบบเรียบ */}
      <div className="mt-4 flex justify-center gap-6 text-sm">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: COLORS[status] }}
            />
            <span>{status}</span>
          </div>
        ))}
      </div>
      </div>
    
  )
}
