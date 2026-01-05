import React from "react";
import ClientDepartmentDetail from "./ClientDepartmentDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  console.log("[Page] Rendering department detail page with id:", id);

  return <ClientDepartmentDetail id={id} />;
}