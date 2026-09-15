"use client";

import { useMemo } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  ArrowLeft,
} from "lucide-react";

import {
  getProjectMembers,
} from "@/lib/project";

import {
  getTaskById,
} from "@/lib/task";

import { isApiError } from "@/lib/errors";

import { Member } from "@/types/project";
import {
  TaskStatus,
} from "@/types/task";

import { formatDateTimeLocal } from "@/utils/formatter";
import { useAuth } from "@/context/AuthContext";
import TaskDetailForm from "../../../../../../components/task/TaskDetailForm";

export default function TaskDetailPage() {
  const { user } = useAuth();
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();

  const router = useRouter();
  const searchParams = useSearchParams();


  const {
    data: taskData,
    isLoading: taskLoading,
    isError: taskError,
    error,
  } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
  });

  const task = taskData?.data;

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  });

  const members: Member[] = useMemo(() => {
    return (
      membersData?.data.map((member) => ({
        memberId: member.memberId,
        userId: member.userId,
        name: member.name,
        role:
          member.role === "LEADER"
            ? "LEADER"
            : "MEMBER",
        isActive: member.isActive,
      })) ?? []
    );
  }, [membersData]);

  /*
   * Permission will be connected to the same project/member
   * logic currently used by TasksPage.
   *
   * We will calculate these after task/member data is available.
   */
  const currentMember = members.find(
    (member) => member.userId === user?.id
  );

  const canManageTask =
    currentMember?.role === "LEADER";

  const canUpdateProgress =
    currentMember?.role === "MEMBER" &&
    task?.assignee?.memberId === currentMember.memberId;


  const handleBackToTasks = () => {
    // back to previous page naturally (based on back stack in browser)
    router.back();
  };

  if (taskLoading || membersLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading task...
        </p>
      </div>
    );
  }

  if (taskError || membersError || !task) {
    const message =
      isApiError(error)
        ? error.message
        : "Failed to load task.";

    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-gray-600">
          {message}
        </p>

        <button
          onClick={handleBackToTasks}
          className="
            rounded-md
            border
            px-4
            py-2
            text-sm
            hover:bg-gray-50
          "
        >
          Back to tasks
        </button>
      </div>
    );
  }

  if (task.deletedAt) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-gray-600">
          This task has been deleted.
        </p>

        <button
          onClick={handleBackToTasks}
          className="
            rounded-md
            border
            px-4
            py-2
            text-sm
            hover:bg-gray-50
          "
        >
          Back to tasks
        </button>
      </div>
    );
  }

  const TASK_STATUS_OPTIONS: TaskStatus[] = [
    "TODO",
    "IN_PROGRESS",
    "DONE",
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Back */}
      <button
        onClick={handleBackToTasks}
        className="
        flex
        w-fit
        shrink-0
        items-center
        gap-2
        text-sm
        text-gray-500
        hover:text-gray-900
      "
      >
        <ArrowLeft className="size-4" />
        Back to tasks list
      </button>

      <TaskDetailForm
        key={`${task.id}-${task.updatedAt}`} // always re-render when task updated
        task={task}
        members={members}
        canManageTask={canManageTask}
        canUpdateProgress={canUpdateProgress}
      />
    </div>
  );
}