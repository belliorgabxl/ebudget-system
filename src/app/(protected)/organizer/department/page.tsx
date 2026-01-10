import { Department } from "@/dto/projectDto";
import { nestGet } from "@/lib/server-api";
import ClientDepartmentList from "./ClientDepartmentList";
import BackGroundLight from "@/components/background/bg-light";

async function getDepartments(): Promise<Department[]> {
  const r = await nestGet<{ data: Department[] }>("/departments");

  if (!r.success) {
    console.error("getDepartments error:", r.message);
    return [];
  }

  return Array.isArray(r.data?.data) ? r.data.data : [];
}

export default async function DepartmentPage() {
  const departments = await getDepartments();
  const total = departments.length;

  return (
    <BackGroundLight>
    <main className="mx-auto max-w-6xl px-4 py-6">
      <ClientDepartmentList />
    </main>
    </BackGroundLight>
  );
}
