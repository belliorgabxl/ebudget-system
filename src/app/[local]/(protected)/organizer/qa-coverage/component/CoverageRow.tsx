import React from "react";
import { AlertTriangle, CheckCircle2, Eye } from "lucide-react";

interface QACoverage {
  code: string;
  name: string;
  projects?: number;
  gaps?: boolean;
}

interface CoverageRowProps {
  item: QACoverage;
  onViewDetail?: () => void;
}
const CoverageRow: React.FC<CoverageRowProps> = ({ item, onViewDetail }) => {
  const pct = Math.min(100, Math.round(((item.projects ?? 0) / 80) * 100));

  return (
    <div className="grid grid-cols-12 items-center gap-2 px-4 py-3 hover:bg-slate-50 transition-colors">
      <div className="col-span-3 sm:col-span-2">
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{item.code}</span>
      </div>

      <div className="col-span-5 sm:col-span-6">
        <div className="text-sm font-medium text-slate-800">{item.name}</div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-2.5 rounded-full bg-indigo-500 transition-[width]"
            style={{ width: `${pct}%` }}
            title={`โครงการ: ${String(item.projects ?? 0)}`}
          />
        </div>
      </div>

      <div className="col-span-2 text-right text-sm font-medium text-slate-800 sm:col-span-2 sm:text-center">
        {(item.projects ?? 0).toLocaleString()}
      </div>

      <div className="col-span-2">
        {item.gaps ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
            <AlertTriangle className="h-3.5 w-3.5" /> มีช่องว่าง
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5" /> ครอบคลุมดี
          </span>
        )}
      </div>

      <div className="col-span-1 text-center">
        <button
          onClick={onViewDetail}
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          title="ดูรายละเอียด"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CoverageRow;
