
export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-300 bg-slate-100 p-4">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900 break-words">
        {value || "—"}
      </div>
    </div>
  );
}