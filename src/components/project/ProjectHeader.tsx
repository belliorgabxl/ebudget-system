import Link from "next/link";
import { Plus } from "lucide-react";

export function ProjectsHeader() {
  return (
    <div className="w-full mb-2 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">โครงการทั้งหมด</h1>
        <p className="text-sm text-gray-600">
          แสดงเฉพาะโครงการที่คุณเป็นเจ้าของหรือผู้รับผิดชอบ
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/organizer/projects/new"
          className="inline-flex items-center duration-400 gap-2
            rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[102%] px-3.5 py-2
            text-sm font-medium text-white hover:bg-black"
        >
          <div className="p-0.5 border-2 border-white rounded-full">
            <Plus className="h-4 w-4 text-white " />
          </div>
          สร้างโครงการ
        </Link>
      </div>
    </div>
  );
}

export function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2  text-sm font-semibold text-center text-gray-700 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={className}>{children}</td>;
}

