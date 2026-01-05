import { fetchProjectInformationServer } from "@/api/project.server";
import EditProjectClient from "@/components/project/EditProjectClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const project = await fetchProjectInformationServer(id);
  return <EditProjectClient id={id} initialData={project} />;
}
