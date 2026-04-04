import { Department } from "@/dto/projectDto";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DepartmentEditForm } from "@/components/department/EditForm";
import BackGroundLight from "@/components/background/bg-light";
import { nestGet } from "@/lib/server-api";

async function getDepartment(id: string): Promise<Department | null> {
  try {
    const r = await nestGet<{ data: Department }>(`/departments/${id}`);
    if (!r.success || !r.data?.data) return null;
    return r.data.data;
  } catch {
    return null;
  }
}

export default async function DepartmentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dep = await getDepartment(id);
  if (!dep) notFound();

  return (
    <BackGroundLight>
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <nav className="text-sm text-gray-500">
            <Link href="/user/department" className="hover:underline">
              หน่วยงาน
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/user/department/${dep.id}`}
              className="hover:underline"
            >
              {dep.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">แก้ไข</span>
          </nav>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">
            แก้ไขหน่วยงาน
          </h1>
        </div>

        <Link
          href={`/user/department/${dep.id}`}
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ยกเลิก
        </Link>
      </div>

      <DepartmentEditForm initial={dep} />
    </main>
    </BackGroundLight>
  );
}
