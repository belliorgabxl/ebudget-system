import { Clock, UserCheck, AlertCircle } from "lucide-react"

interface Props {
  avgDays: number
  slowestLevel: string
  topRole: string
}

export function ApprovalHealthCard({
  avgDays,
  slowestLevel,
  topRole,
}: Props) {
  return (
    <div className="rounded-xl bg-white shadow-xl p-6">
      <h3 className="mb-4 text-base font-semibold">
        สุขภาพกระบวนการอนุมัติ
      </h3>

      <div className="space-y-4">
        <Item
          icon={<Clock />}
          label="ระยะเวลาอนุมัติเฉลี่ย"
          value={`${avgDays} วัน`}
        />
        <Item
          icon={<AlertCircle />}
          label="ขั้นตอนที่ช้าที่สุด"
          value={slowestLevel}
        />
        <Item
          icon={<UserCheck />}
          label="Role ที่อนุมัติมากที่สุด"
          value={topRole}
        />
      </div>
    </div>
  )
}

function Item({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
