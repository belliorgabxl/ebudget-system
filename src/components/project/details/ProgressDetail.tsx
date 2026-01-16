import { CheckCircle, Clock, XCircle } from "lucide-react";

export type ProcessStep = {
  title: string;
  status: "approved" | "pending" | "rejected";
  by?: string;
  at?: string;
  note?: string;
};

function StepIcon({ s }: { s: "approved" | "pending" | "rejected" }) {
  if (s === "approved")
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (s === "pending") return <Clock className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-red-600" />;
}

export function ProcessTooltip({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="mt-2 bg-white w-[320px] rounded-xl border border-gray-200 p-3 shadow-lg">
      <div className="text-xs font-semibold  text-gray-800">
        ประวัติความคืบหน้า
      </div>

      <div className="mt-2 space-y-2">
        {steps.map((st, idx) => (
          <div
            key={idx}
            className={`rounded-lg border p-2 ${
              st.status === "approved"
                ? "border-green-200 bg-green-50"
                : st.status === "pending"
                ? "border-amber-200 bg-amber-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-2">
              <StepIcon s={st.status} />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-gray-900">
                  {st.title}
                </div>

                {st.by || st.at ? (
                  <div className="mt-0.5 text-[11px] text-gray-600">
                    {st.by ? `โดย ${st.by}` : ""}
                    {st.by && st.at ? " • " : ""}
                    {st.at ?? ""}
                  </div>
                ) : null}

                {st.note ? (
                  <div className="mt-0.5 text-[11px] text-gray-600">
                    {st.note}
                  </div>
                ) : null}
              </div>

              <div className="ml-auto text-[11px] font-semibold">
                {st.status === "approved" ? (
                  <span className="text-green-700">อนุมัติแล้ว</span>
                ) : st.status === "pending" ? (
                  <span className="text-amber-700">รอการอนุมัติ</span>
                ) : (
                  <span className="text-red-700">ไม่อนุมัติ</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
