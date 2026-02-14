"use client"

import { useState, useMemo } from "react"
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

interface BudgetByYearChartProps {
  data: {
    year: string
    budget: number
  }[]
}

// ตัวเลือกช่วงปี
type RangeOption = 5 | 10 | 20

const YEAR_LEGEND = [
  { key: "budget", label: "งบประมาณ", color: "#3b82f6" },
]

export function BudgetByYearChart({ data }: BudgetByYearChartProps) {
  const [range, setRange] = useState<RangeOption>(5)
  const isEmpty = !data || data.length === 0

  // sort + slice ตามช่วงปี
  const displayData = useMemo(() => {
    if (isEmpty) return []
    const sorted = [...data].sort(
      (a, b) => Number(a.year) - Number(b.year)
    )
    return sorted.slice(-range)
  }, [data, range, isEmpty])

  return (
    <div className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-6">

      {/* ===== Header ===== */}
      <div className="flex items-center justify-between bg-muted/30">
        <div>
          <h3 className="text-base font-semibold">
            แนวโน้มงบประมาณทั้งองค์กร
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            แสดงงบประมาณตามช่วงเวลาที่เลือก
          </p>
        </div>

        {/* ===== Range Select ===== */}
        <div className=" row-gap-2 flex items-center gap-4">
          <div className="text-sm"> เลือกช่วงปีที่แสดง :</div>

          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value) as RangeOption)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 ปี</option>
            <option value={10}>10 ปี</option>
            <option value={20}>20 ปี</option>
          </select>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-[320px] text-gray-500">
          <div className="text-center">
            <p className="text-sm">ไม่มีข้อมูล</p>
            <p className="text-xs mt-1">ยังไม่มีข้อมูลงบประมาณตามปี</p>
          </div>
        </div>
      ) : (
      <>
      {/* ===== Chart ===== */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={displayData}
            barGap={6}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatCompactNumber(value)} />
            <Tooltip formatter={(v: number) => [`฿${formatCompactNumber(v)}`, ""]} />

            <Bar
              dataKey="budget"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={50}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* ===== Custom Legend ===== */}
        <div className="mt-4 flex justify-center gap-x-6 text-sm">
          {YEAR_LEGEND.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  )
}
