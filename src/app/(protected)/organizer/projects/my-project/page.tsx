"use client";

import { EmptyState } from "@/components/project/EmptyState";
import { LoadData } from "@/components/project/LoadData";
import { useEffect, useState } from "react";
import type { GetProjectsByOrgRespond, Pagination } from "@/dto/dashboardDto";
import { GetProjectsByOrgFromApi } from "@/api/dashboard";
import BackGroundLight from "@/components/background/bg-light";
import { ProjectsPagination } from "@/components/project/ProjectPagination";
import { ProjectsHeader } from "@/components/project/ProjectHeader";
import { ProjectsSummaryCard } from "@/components/project/ProjectSummaryCard";
import { ProjectsTable } from "@/components/project/ProjectTable";

export default function Page() {
  const [projects, setProjects] = useState<GetProjectsByOrgRespond[]>([]);
  const [fetchDataLoader, setFetchDataLoader] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [pg, setPg] = useState<Pagination | null>(null);

  const hasProjects = projects.length > 0;

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        setFetchDataLoader(true);

        const res = await GetProjectsByOrgFromApi({ page, limit });
        if (cancelled) return;

        if (!res) {
          setProjects([]);
          setPg(null);
          return;
        }

        setProjects(res.data ?? []);
        setPg(res.pagination ?? null);
      } catch (err) {
        console.error("[Page] loadProjects error:", err);
        if (!cancelled) {
          setProjects([]);
          setPg(null);
        }
      } finally {
        if (!cancelled) setFetchDataLoader(false);
      }
    };

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, [page, limit]);

  const canPrev = !!pg?.has_prev && page > 1;
  const canNext = !!pg?.has_next;

  return (
    <BackGroundLight>
      <main className="w-full grid place-items-center lg:px-18 md:px-10 sm:px-5 px-1 py-6">
        <div className="lg:px-20 lg:pt-0 pt-10 px-2 w-full">
          <ProjectsHeader />
          <ProjectsSummaryCard total={pg?.total} />
        </div>

        {fetchDataLoader ? (
          <LoadData />
        ) : !hasProjects ? (
          <EmptyState />
        ) : (
          <div className="flex justify-center lg:px-20 px-0 w-full">
            <section className="w-full grid place-items-center relative sm:mx-0 overflow-x-auto ">
              <div className="w-full overflow-y-auto rounded bg-white">
                <ProjectsTable projects={projects} page={page} limit={limit} />
              </div>

              <ProjectsPagination
                page={page}
                pg={pg}
                canPrev={canPrev}
                canNext={canNext}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            </section>
          </div>
        )}
      </main>
    </BackGroundLight>
  );
}
