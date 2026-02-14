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
  "ร่าง": "#94a3b8",      // slate
  "แก้ไข": "#f59e0b",     // amber
  "รออนุมัติ": "#3b82f6", // blue
  "อนุมัติแล้ว": "#10b981", // green
}

const STATUS_ORDER = ["ร่าง", "แก้ไข", "รออนุมัติ", "อนุมัติแล้ว"]

export function ProjectCountByStatusChart({
  data,
}: ProjectCountByStatusChartProps) {
  const isEmpty = !data || data.length === 0
  
  // Sort data by status order
  const sortedData = isEmpty ? [] : [...data].sort((a, b) => {
    const indexA = STATUS_ORDER.indexOf(a.status)
    const indexB = STATUS_ORDER.indexOf(b.status)
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
  })

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

      {isEmpty ? (
        <div className="flex items-center justify-center h-[320px] text-gray-500">
          <div className="text-center">
            <p className="text-sm">ไม่มีข้อมูล</p>
            <p className="text-xs mt-1">ยังไม่มีข้อมูลจำนวนโครงการตามสถานะ</p>
          </div>
        </div>
      ) : (
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={sortedData}
              dataKey="value"
              nameKey="status"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={1}
              label={({ value }) => `${value} โครงการ`}
              labelLine={false}
            >
              {sortedData.map((item, index) => (
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
          {STATUS_ORDER.filter(status => sortedData.some(d => d.status === status)).map((status) => (
            <div
              key={status}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: STATUS_COLORS[status] ?? "#9ca3af",
                }}
              />
              <span>{status}</span>
            </div>
          ))}
        </div>
      </div>
      )}
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
