"use client"

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"

interface ProjectCountByDeptChartProps {
  data: Array<{
    department: string
    count: number
  }>
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#ec4899",
  "#22c55e",
  "#0ea5e9",
  "#f97316",
]

export function ProjectCountByDeptChart({
  data,
}: ProjectCountByDeptChartProps) {
  // If more than 6 departments, keep top 6 and group the rest as "อื่นๆ"
  const processedData = data.length > 6
    ? (() => {
        // Sort by count descending
        const sorted = [...data].sort((a, b) => b.count - a.count)
        // Take top 6
        const top6 = sorted.slice(0, 6)
        // Sum the rest (from 7th onwards)
        const others = sorted.slice(6)
        const othersCount = others.reduce((sum, item) => sum + item.count, 0)
        
        // Return top 6 + "อื่นๆ" if there are others
        return othersCount > 0 
          ? [...top6, { department: "อื่นๆ", count: othersCount }]
          : top6
      })()
    : data

  return (
    <div className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-6">

      {/* ===== Header ===== */}
      <div className=" bg-muted/30">
        <h3 className="text-base font-semibold">
          จำนวนโครงการต่อหน่วยงาน
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          สัดส่วนโครงการแยกตามหน่วยงานที่รับผิดชอบ
        </p>
      </div>

      {/* ===== Chart ===== */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={processedData}
              dataKey="count"
              nameKey="department"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={1}
              label={({ value }) => `${value} โครงการ`}
              labelLine={false}
            >
              {processedData.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* ===== Custom Legend (ถูกต้อง) ===== */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {processedData.map((item, i) => (
            <div
              key={item.department}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor:
                    COLORS[i % COLORS.length],
                }}
              />
              <span>{item.department}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0]
    const fill = payload[0].payload.fill

    return (
      <div
        className="rounded-md bg-white px-3 py-2 text-xs shadow border"
        style={{
          borderColor: fill,  
        }}
      >
        <span
          className="mr-1 inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: fill }}  
        />
        หน่วยงาน <b>{name}</b> มีโครงการ:{" "}
        <b>{value}</b> โครงการ
      </div>
    )
  }
  return null
}
