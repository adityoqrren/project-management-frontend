"use client";

import ProjectSidebar from "@/components/project/ProjectSidebar"
import { useAuth } from "@/context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { getProjectById } from "@/lib/project";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  const { projectId } =
    useParams<{ projectId: string }>();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const { user } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchStatus,
    status
  } = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProjectById(projectId),
  });

  console.log({
    projectId,
    data,
    isLoading,
    isError,
    error,
  });

  console.log(`fetch status -> ${fetchStatus}`);

  console.log(`query status -> ${status}`);

  console.log("ProjectLayout render");

  if (isLoading) {
    return <div>Loading project...</div>;
  }

  if (isError || !data) {
    return <div>Error getting project</div>;
  }

  const project = data.data;

  const canManageProject =
    project.owner === user?.id;

  console.log(`canManageProject = ${canManageProject} - ${project.owner} -- ${user?.id}`);

  return (
    <ProjectProvider
      value={{
        project,
        canManageProject,
      }}
    >
      <div className="flex h-full min-h-0">

        {/* Desktop Sidebar */}
        <div className="hidden shrink-0 md:block">
          <ProjectSidebar />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div
            className="
            fixed inset-0
            z-50
            md:hidden
          "
          >

            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() =>
                setSidebarOpen(false)
              }
            />

            {/* Drawer */}
            <div
              className="
              absolute left-0 top-0
              h-full
              bg-white
            "
            >
              <ProjectSidebar />
            </div>

          </div>
        )}

        {/* Main Content */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">

          {/* Mobile Header */}
          <div
            className="
            md:hidden
            border-b
            px-4
            py-3
            flex
            items-center
            gap-3
            shrink-0
          "
          >

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              ☰
            </button>

            <span className="font-medium">
              {project.name}
            </span>

          </div>

            {/** flex-1 : take remaining height |
             *   min-h-0 : can shrink just to match remaining height if content's height more than remaining height to make overflow works
             * ---> boundaries */}
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {children}
          </div>

        </div>

      </div>
    </ProjectProvider>
  )
}