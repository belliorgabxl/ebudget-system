"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  BarChart
} from "recharts"

interface Props {
  data: { year: string; budget: number; }[]
}

export function BudgetTrendAllTimeChart({ data }: Props) {
  return (
    <div className="rounded-xl bg-white shadow-xl p-6">
      <div className=" bg-muted/30 ">
        <h3 className="text-base font-semibold">
          แนวโน้มงบประมาณทั้งองค์กร
        </h3>
        <p className="text-xs text-muted-foreground">
          สะสมทุกปีงบประมาณ
        </p>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(v: number) => `฿${v}M`} />
            
                        <Bar dataKey="budget" fill="#3b82f6" name="งบประมาณ" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
