"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ProjectHeader from "@/components/project/ProjectHeader";
import TaskListPreview from "@/components/project/TaskListPreview";
import TeamMembersCard from "@/components/project/TeamMembersCard";
import { getProjectById, getProjectMembers, getProjectStatistics } from "@/lib/project";
import { Member } from "@/types/project";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProjectStatisticsCards from "@/components/project/ProjectStatisticsCards";
import { getRecentProjectTasks } from "@/lib/task";
import { useProject } from "@/context/ProjectContext";


export default function ProjectOverviewPage() {
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const { project, canManageProject } = useProject();

  const queryClient = useQueryClient();

  // const {
  //   data: projectData,
  //   isLoading: projectLoading,
  //   error: projectError,
  // } = useQuery({
  //   queryKey: ["projects", projectId],
  //   queryFn: () => getProjectById(projectId),
  //   enabled: !!projectId,
  // });

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  });

  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    error: statisticsError,
  } = useQuery({
    queryKey: ["projectStatistics", projectId],
    queryFn: () => getProjectStatistics(projectId),
    enabled: !!projectId,
  });

  const {
    data: recentTasksData,
    isLoading: recentTasksLoading,
    error: recentTasksError,
  } = useQuery({
    queryKey: ["recentTasks", projectId],
    queryFn: () =>
      getRecentProjectTasks(projectId),
    enabled: !!projectId,
  });

  const loading = membersLoading || statisticsLoading || recentTasksLoading;

  const error = membersError || statisticsError || recentTasksError;

  const members: Member[] = useMemo(() => {
    return (
      membersData?.data ?? []
    );
  }, [membersData]);


  // const canManageProject = project?.owner == user?.id

  const refreshMembers = () => {
    queryClient.invalidateQueries({
      queryKey: ["projectMembers", projectId],
    });
  };

  if (loading) {
    return <div className="text-gray-400">Loading project...</div>;
  }

  if (!project) {
    return <div className="text-red-500">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
      />

      <ProjectStatisticsCards
        statistics={statisticsData!.statistics}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamMembersCard
          members={members}
          projectId={projectId}
          onRefresh={refreshMembers}
          canManageProject={canManageProject}
        />
        <TaskListPreview
          projectId={projectId}
          tasks={recentTasksData?.data ?? []}
          loading={recentTasksLoading}
        />
      </div>
    </div>
  );
}