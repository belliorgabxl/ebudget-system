type Props = {
  total?: number | null;
};

export function ProjectsSummaryCard({ total }: Props) {
  return (
    <section className="relative mb-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative w-full lg:px-5 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-200 px-6 py-2 text-white shadow-md shadow-indigo-300/30">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex items-center lg:gap-8 gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl shadow-inner shadow-black/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white drop-shadow-lg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7.5l9-4.5 9 4.5M3 7.5l9 4.5 9-4.5M3 7.5v9l9 4.5 9-4.5v-9"
                />
              </svg>
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-2xl font-extrabold tracking-tight drop-shadow">
                {total || "กำลังโหลด..."}
              </span>
              <span className="text-xl uppercase tracking-wide text-white font-medium">
                โครงการ
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
