import React from "react";

interface QAIndicator {
  code: string;
  name: string;
  year?: number;
}

interface IndicatorCardProps {
  item: QAIndicator;
  onView?: () => void;
}
const IndicatorCard: React.FC<IndicatorCardProps> = ({ item, onView }) => {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {item.code}
          </div>
          <div className="mt-2 text-sm font-medium text-slate-900">{item.name}</div>
          {item.year && <div className="mt-1 text-xs text-slate-500">ปีอ้างอิง: {item.year}</div>}
        </div>
        <div className="mt-1 h-8 w-8 shrink-0 rounded-xl bg-indigo-100 text-indigo-700 grid place-items-center text-xs font-semibold">
          QA
        </div>
      </div>
    </div>
  );
};

export default IndicatorCard;
