import ClientDepartmentList from "./ClientDepartmentList";
import BackGroundLight from "@/components/background/bg-light";

export default function DepartmentPage() {
  return (
    <BackGroundLight>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <ClientDepartmentList />
      </main>
    </BackGroundLight>
  );
}
