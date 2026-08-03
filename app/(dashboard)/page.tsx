"use client"

import DashboardProjects from "@/components/dashboard/DashboardProjects";
import SimpleTasksList from "@/components/dashboard/DashboardTasks";
import { getProjectMembers, getProjects } from "@/lib/project";
import { getMyTaskCounts, getMyTasks } from "@/lib/task";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  FolderKanban,
  ListTodo,
  Clock3,
  TriangleAlert,
} from "lucide-react";
import { getDashboardStatistics } from "@/lib/dashboard";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import { useAuth } from "@/context/AuthContext";
import TaskPills from "@/components/task/TaskPills";
import DashboardTasks from "@/components/dashboard/DashboardTasks";
import { Task } from "@/types/task";
import TaskDetailDialog from "@/components/task/TaskDetailDialog";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const tasksSectionRef = useRef<HTMLElement>(null);

  // const [projectId, setProjectId] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [dueFilter, setDueFilter] = useState("");

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [openTaskDialog, setOpenTaskDialog] =
    useState(false);

  const { user } = useAuth();

  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    error: statisticsError,
  } = useQuery({
    queryKey: ["dashboardStatistics"],
    queryFn: getDashboardStatistics,
  });

  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["dashboardProjects"],
    queryFn: () =>
      getProjects({
        limit: 5,
        sortBy: "lastActivityAt",
        order: "desc",
      }),
  });

  const {
    data: taskCountsData,
    isLoading: taskCountsLoading,
    error: taskCountsError,
  } = useQuery({
    queryKey: ["dashboardTaskCounts"],
    queryFn: getMyTaskCounts,
  });

  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: [
      "dashboardTasks",
      taskStatus,
      dueFilter,
    ],
    queryFn: () =>
      getMyTasks({
        limit: 5,
        sortBy: "lastActivityAt",
        order: "desc",

        taskStatus:
          taskStatus || undefined,

        dueFilter:
          dueFilter || undefined,
      }),
  });

  const {
    data: membersData,
  } = useQuery({
    queryKey: [
      "projectMembers",
      selectedTask?.project.id,
    ],
    queryFn: () =>
      getProjectMembers(
        selectedTask!.project.id
      ),
    enabled: !!selectedTask,
  })

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setOpenTaskDialog(true);
  };

  const handleCloseTask = () => {
    setSelectedTask(null);
    setOpenTaskDialog(false);
  };

  const scrollToTasks = () => {
    tasksSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const projects = projectsData?.data ?? [];
  const tasks = tasksData?.data ?? [];

  const currentMember =
    membersData?.data.find(
      (m) => m.userId === user?.id
    );

  const canManageTask =
    currentMember?.role === "LEADER";

  const canUpdateProgress =
    currentMember?.role === "MEMBER" &&
    selectedTask?.assignee?.memberId === currentMember.memberId;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">

      <h1 className="text-3xl font-bold">
        Good Morning, {user?.username}
      </h1>

      <p className="text-gray-500 mt-1">
        Here&apos;s what&apos;s happening across your projects today.
      </p>

      {/* Dashboard Statistics */}

      {statisticsLoading ? (

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 rounded-lg border animate-pulse bg-gray-100"
            />
          ))}

        </div>

      ) : statisticsError ? (

        <div className="text-red-500">
          Failed to load dashboard statistics
        </div>

      ) : (

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <DashboardStatCard
            title="Projects"
            value={statisticsData?.statistics.projects ?? 0}
            icon={<FolderKanban size={28} />}
            onClick={() => router.push("/projects")}
          />

          <DashboardStatCard
            title="Assigned Tasks"
            description="Undone tasks assigned to you"
            value={statisticsData?.statistics.assignedTasks ?? 0}
            icon={<ListTodo size={28} />}
            valueClassName="mt-2 text-3xl font-bold text-blue-600"
            iconClassName="text-blue-400"
            onClick={() => {
              setTaskStatus("");
              setDueFilter("");
              scrollToTasks();
            }}
          />

          <DashboardStatCard
            title="Due Soon"
            description="Tasks due within the next 3 days"
            value={statisticsData?.statistics.dueSoon ?? 0}
            icon={<Clock3 size={28} />}
            valueClassName="mt-2 text-3xl font-bold text-yellow-600"
            iconClassName="text-yellow-500"
            onClick={() => {
              setTaskStatus("");
              setDueFilter("dueSoon");
              scrollToTasks();
            }}
          />

          <DashboardStatCard
            title="Overdue"
            description="Tasks past their due date"
            value={statisticsData?.statistics.overdue ?? 0}
            icon={<TriangleAlert size={28} />}
            valueClassName="mt-2 text-3xl font-bold text-red-600"
            iconClassName="text-red-500"
            onClick={() => {
              setTaskStatus("");
              setDueFilter("overdue");
              scrollToTasks();
            }}
          />

        </div>

      )}

      {/* My Projects */}
      <DashboardProjects
        projects={projects}
        loading={projectsLoading}
        error={projectsError as Error | null}
      />

      {/* My Tasks */}
      <section
        ref={tasksSectionRef}
        className="space-y-4">
        <h2 className="text-2xl font-semibold mb-2">My Tasks</h2>
        <p className="text-sm text-gray-500 mb-6">
          Tasks around your projects and work
        </p>

        {/* TaskPills */}
        <TaskPills
          counts={taskCountsData?.counts}
          loading={taskCountsLoading}
          taskStatus={taskStatus}
          dueFilter={dueFilter}
          onChange={(status, due) => {
            setTaskStatus(status);
            setDueFilter(due);
          }}
        />

        <DashboardTasks
          tasks={tasks}
          loading={tasksLoading}
          error={tasksError as Error | null}
          onOpenTask={handleOpenTask}
        />
      </section>

      {selectedTask && (
        <TaskDetailDialog
          key={selectedTask.id}
          open={openTaskDialog}
          onClose={handleCloseTask}
          // mode="owner"
          task={selectedTask}
          canManageTask={canManageTask}
          canUpdateProgress={canUpdateProgress}
        />
      )}

    </div>
  )
}