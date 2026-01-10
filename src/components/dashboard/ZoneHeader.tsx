interface ZoneHeaderProps {
  title: string
  subtitle?: string
}

export function ZoneHeader({ title, subtitle }: ZoneHeaderProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
