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

interface BudgetByStatusChartProps {
  data: {
    status: string
    budget: number
  }[]
}

const COLORS: Record<string, string> = {
  อนุมัติ: "#10b981",  
  รออนุมัติ: "#f59e0b",  
  ไม่อนุมัติ: "#ef4444",
  ปิดโครงการ: "#6b7280",
}

export function BudgetByStatusChart({ data }: BudgetByStatusChartProps) {
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
          data={data}
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
          />

          <Tooltip
            formatter={(v: number) => [`฿${v}M`, "งบประมาณ"]}
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
            {data.map((d, i) => (
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
        {Object.entries(COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
