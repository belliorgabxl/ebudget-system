"use client";

import { useRouter } from "next/navigation";
import BackGroundLight from "@/components/background/bg-light";
import CreateDepartmentForm from "@/components/department/CreateDepartmentForm";

export default function CreateDepartmentPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/organizer/department");
  };

  const handleSuccess = () => {
    router.push("/organizer/department");
  };

  return (
    <BackGroundLight>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">สร้างหน่วยงานใหม่</h1>
          
          <CreateDepartmentForm onCancel={handleCancel} onSuccess={handleSuccess} />
        </div>
      </main>
    </BackGroundLight>
  );
}
