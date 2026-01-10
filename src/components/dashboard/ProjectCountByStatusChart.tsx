"use client"

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"

interface ProjectCountByStatusChartProps {
  data: Array<{
    status: string
    value: number
  }>
}

// สีตาม semantic ของสถานะ
const STATUS_COLORS: Record<string, string> = {
  อนุมัติ: "#10b981",     // green
  รออนุมัติ: "#f59e0b",  // amber
  ไม่อนุมัติ: "#ef4444", // red
}

export function ProjectCountByStatusChart({
  data,
}: ProjectCountByStatusChartProps) {
  return (
    <div className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-6">

      {/* ===== Header ===== */}
      <div className="bg-muted/30">
        <h3 className="text-base font-semibold">
          จำนวนโครงการตามสถานะ
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          สัดส่วนโครงการแยกตามสถานะการอนุมัติ
        </p>
      </div>

      {/* ===== Chart ===== */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="status"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={1}
              label={({ value }) => `${value} โครงการ`}
              labelLine={false}
            >
              {data.map((item, index) => (
                <Cell
                  key={item.status}
                  fill={STATUS_COLORS[item.status] ?? "#9ca3af"}
                />
              ))}
            </Pie>

            <Tooltip content={<StatusCustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* ===== Custom Legend ===== */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {data.map((item) => (
            <div
              key={item.status}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor:
                    STATUS_COLORS[item.status] ?? "#9ca3af",
                }}
              />
              <span>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


const StatusCustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value, color } = payload[0]

    return (
      <div
        className="rounded-md bg-white px-3 py-2 text-xs shadow"
        style={{ borderColor: color }}
      >
        <span
          className="mr-1 inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        สถานะ <b>{name}</b> มีโครงการ:{" "}
        <b style={{ color }}>{value}</b> โครงการ
      </div>
    )
  }
  return null
}
