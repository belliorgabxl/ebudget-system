import type { Pagination } from "@/dto/dashboardDto";

type Props = {
  page: number;
  pg: Pagination | null;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function ProjectsPagination({
  page,
  pg,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="text-xs text-gray-600">
        หน้า {page}
        {pg ? ` • รวม ${pg.total} รายการ • ทั้งหมด ${pg.total_pages} หน้า` : ""}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={onPrev}
          className={`rounded-lg px-3 py-2 text-sm shadow-sm ${
            !canPrev
              ? "opacity-50 cursor-not-allowed bg-gray-100"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          ก่อนหน้า
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className={`rounded-lg px-3 py-2 text-sm shadow-sm ${
            !canNext
              ? "opacity-50 cursor-not-allowed bg-gray-100"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
