import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  hint?: string;
  color?: "indigo" | "emerald" | "amber";
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, hint, color = "indigo" }) => {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  } as const;
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-2 rounded-xl px-2.5 py-1 text-xs ring-1 ${colorMap[color]}`}>
          {icon}
          {title}
        </span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
};

export default StatCard;
