"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, Trash2, X } from "lucide-react";

import { ToastType, useToast } from "@/context/ToastContext";

import {
  archiveTask,
  assignTask,
  deleteTask,
  unarchiveTask,
  updateTask,
  updateTaskProgress,
} from "@/lib/task";

import { invalidateDashboard } from "@/lib/dashboard";

import { Member } from "@/types/project";
import {
  Priority,
  Task,
  TaskStatus,
} from "@/types/task";


import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatDateTimeLocal } from "@/utils/formatter";
import AssigneeSelector from "@/components/ui/AssigneeSelector";
import DateTimePicker from "@/components/ui/DateTimePicker";
import CommentsSection from "./CommentsSection";
import TaskAttachments from "./attachments/TaskAttachments";
import TaskActivityHistory from "./TaskActivityHistory";
import TaskActivityTabs from "./TaskActivityTabs";
import TaskProperties from "./TaskProperties";
import RichTextEditor from "../ui/editor/RichTextEditor";


interface TaskDetailFormProps {
  task: Task;
  members: Member[];
  canManageTask: boolean;
  canUpdateProgress: boolean;
  onTaskArchivedOrDeleted: () => void;
}

export default function TaskDetailForm({
  task,
  members,
  canManageTask,
  canUpdateProgress,
  onTaskArchivedOrDeleted,
}: TaskDetailFormProps) {
  const isArchived = task?.archiveSource !== null &&
    task?.archiveSource !== undefined;

  const isReadOnly = isArchived

  const taskArchiveStatus =
    task?.archiveSource === "MANUAL"
      ? "Archived"
      : task?.archiveSource === "PROJECT"
        ? "Archived by Project"
        : "Active";

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [confirmDeleteOpen, setConfirmDeleteOpen] =
    useState(false);

  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);

  const [confirmUnarchiveOpen, setConfirmUnarchiveOpen] = useState(false);

  const [descriptionEditing, setDescriptionEditing] = useState(false);

  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    assignee: task.assignee ?? null,
    startDate: task.startDate,
    dueDate: task.dueDate ?? "",
    isActive: task.isActive,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (canManageTask) {
        const response = await updateTask(task.id, {
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          startDate: form.startDate,
          dueDate: form.dueDate || undefined,
        });

        if (
          task.assignee?.memberId !==
          form.assignee?.memberId
        ) {
          await assignTask(
            task.id,
            form.assignee?.memberId ?? null
          );
        }

        return response;
      }

      if (canUpdateProgress) {
        return updateTaskProgress(task.id, {
          status: form.status,
        });
      }

      throw new Error(
        "You do not have permission to update this task."
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["task", task.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["projectTasks", task.project.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["myTasks"],
      });

      invalidateDashboard(queryClient);

      showToast("Task updated successfully");
    },

    onError: (error) => {
      console.error(error);

      showToast(
        "Failed to update task",
        ToastType.error
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["task", task.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["projectTasks", task.project.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["deletedProjectTasks", task.project.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myTasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["archivedProjectTasks", task.project.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["projectStatistics", task.project.id]
        })
      ]);

      invalidateDashboard(queryClient);

      showToast("Task deleted successfully");

      setConfirmDeleteOpen(false);

      onTaskArchivedOrDeleted();
    },

    onError: (error) => {
      console.error(error);

      showToast(
        "Failed to delete task",
        ToastType.error
      );
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveTask(task.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["task", task.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["projectTasks", task.project.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["archivedProjectTasks", task.project.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myTasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["projectStatistics", task.project.id]
        })
      ]);

      invalidateDashboard(queryClient);

      showToast("Task archived successfully");
      setConfirmArchiveOpen(false);
      onTaskArchivedOrDeleted();
    },
    onError: (error) => {
      console.error(error);
      showToast("Failed to archive task", ToastType.error);
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: () => unarchiveTask(task.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["task", task.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["projectTasks", task.project.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["archivedProjectTasks", task.project.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myTasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["projectStatistics", task.project.id]
        })
      ]);

      invalidateDashboard(queryClient);

      showToast("Task successfully restored to Active tasks list");
      setConfirmArchiveOpen(false);
      onTaskArchivedOrDeleted();
    },
    onError: (error) => {
      console.error(error);
      showToast("Failed to unarchive task", ToastType.error);
    },
  });

  const canEdit =
    canManageTask || canUpdateProgress;

  const canManageAttachment =
    canManageTask || canUpdateProgress;

  const isSaving =
    updateMutation.isPending;

  const isArchiving = archiveMutation.isPending;

  const isUnarchiving = unarchiveMutation.isPending;

  const isDeleting =
    deleteMutation.isPending;

  const createdAt = formatDateTimeLocal(
    task.createdAt
  );

  const updatedAt = formatDateTimeLocal(
    task.updatedAt
  );

  const handleSave = () => {
    updateMutation.mutate();
  };

  const handleStartDateChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      startDate: value,
    }));
  };

  const handleDueDateChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      dueDate: value,
    }));
  };

  const handleStatusChange = (value: TaskStatus) => {
    setForm((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handlePriorityChange = (value: Priority) => {
    setForm((prev) => ({
      ...prev,
      priority: value,
    }));
  };

  const handleActiveChange = (value: boolean) => {
    setForm((prev) => ({
      ...prev,
      isActive: value,
    }));
  };

  const handleDescriptionEdit = () => {
    setDescriptionEditing(true);
  };

  const handleDescriptionCancel = () => {
    setForm((prev) => ({
      ...prev,
      description: task.description ?? "",
    }));

    setDescriptionEditing(false);
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Header */}
        <div className="shrink-0 border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">
                TASK DETAIL
              </p>

              <h1 className="text-lg font-semibold">
                {task.title}
              </h1>

              <div className="shrink-0">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${taskArchiveStatus === "Active"
                    ? "bg-green-100 text-green-700"
                    : taskArchiveStatus === "Archived"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-amber-100 text-amber-700"
                    }`}
                >
                  {taskArchiveStatus}
                </span>
              </div>
            </div>

            {(canEdit && !isReadOnly) && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="
                rounded-md
                bg-black
                px-4
                py-2
                text-sm
                text-white
                hover:bg-gray-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              >
                {isSaving
                  ? "Saving..."
                  : "Save changes"}
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto py-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

            {/* Left column */}
            <div className="space-y-5">

              {/* Title */}
              <div>
                <label className="text-sm text-gray-500">
                  Task title
                </label>

                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  disabled={!canManageTask || isReadOnly}
                  className="
                  mt-1
                  w-full
                  rounded-md
                  border
                  px-3
                  py-2
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-400
                  disabled:bg-gray-100
                "
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-500">
                  Description
                </label>

                {/* <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  disabled={!canManageTask}
                  rows={8}
                  className="
                  mt-1
                  w-full
                  resize-none
                  rounded-md
                  border
                  px-3
                  py-2
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-400
                  disabled:bg-gray-100
                "
                /> */}

                {descriptionEditing && !isReadOnly ? (
                  <div className="space-y-2">
                    <RichTextEditor
                      content={form.description}
                      onChange={(value) => {
                        setForm((prev) => ({
                          ...prev,
                          description: value,
                        }))
                        console.log(`value detail task form: ${value}`)
                      }
                      }
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleDescriptionCancel}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-md
                          border
                          border-red-300
                          bg-transparent
                          px-3
                          py-2
                          text-sm
                          font-medium
                          text-red-600
                          transition
                          hover:bg-red-50
                          hover:text-red-700
                        "
                      >
                        <X className="h-4 w-4" />
                        Cancel changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleDescriptionEdit}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleDescriptionEdit();
                      }
                    }}
                    className="
                      min-h-24
                      w-full
                      cursor-text
                      rounded-md
                      border
                      px-3
                      py-2
                      text-left
                      text-sm
                      hover:bg-gray-50
                      focus:outline-none
                      focus:ring-2
                      focus:ring-gray-200
                    "
                  >
                    {form.description ? (
                      <div
                        className="
                          prose
                          prose-sm
                          max-w-none
                          text-gray-900
                          prose-headings:text-gray-900
                          prose-p:my-1
                          prose-ul:my-2
                          prose-ol:my-2
                          prose-li:my-0
                          prose-blockquote:my-3
                          prose-a:text-blue-600
                          prose-a:underline
                          hover:prose-a:text-blue-700
                        "
                        dangerouslySetInnerHTML={{
                          __html: form.description,
                        }}
                      />
                    ) : (
                      <span className="text-gray-400">
                        No description
                      </span>
                    )}
                  </div>
                )}

              </div>

              {/* Assignee */}
              <div>
                <label className="text-sm text-gray-500">
                  Assignee
                </label>

                <div className="mt-1">
                  {canManageTask && !isReadOnly ? (
                    <AssigneeSelector
                      users={members}
                      value={form.assignee}
                      onChange={(member) =>
                        setForm((previous) => ({
                          ...previous,
                          assignee: member,
                        }))
                      }
                    />
                  ) : (
                    <div className="rounded-md border bg-gray-100 px-3 py-2 text-sm">
                      {form.assignee?.name ??
                        "Unassigned"}
                    </div>
                  )}
                </div>
              </div>

              {/* Task Properties - mobile only */}
              <div className="lg:hidden">
                <TaskProperties
                  startDate={form.startDate}
                  dueDate={form.dueDate}
                  status={form.status}
                  priority={form.priority}
                  isActive={form.isActive}
                  canManageTask={canManageTask}
                  canEdit={canEdit}
                  isReadOnly={isReadOnly}
                  onStartDateChange={handleStartDateChange}
                  onDueDateChange={handleDueDateChange}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onActiveChange={handleActiveChange}
                />
              </div>

              {/* Attachments */}
              <TaskAttachments
                taskId={task.id}
                canManageAttachment={
                  canManageAttachment && !isReadOnly
                }
              />

              {/** Task Activity Tabs : Comments and Activity (for mobile only) */}
              <div className="lg:hidden">
                <TaskActivityTabs
                  taskId={task.id}
                  canManageTask={canManageTask}
                  isReadOnly={isReadOnly}
                />
              </div>

              {/* Comments (for desktop only) */}
              <div className="hidden lg:block mt-8">
                {/* Comments will be implemented here */}
                <CommentsSection
                  taskId={task.id}
                  canManageTask={canManageTask}
                  isReadOnly={isReadOnly}
                />
              </div>

            </div>

            {/* Right column */}
            <div className="space-y-5">

              {/* Task Properties - mobile only */}
              <div className="hidden lg:block">
                <TaskProperties
                  startDate={form.startDate}
                  dueDate={form.dueDate}
                  status={form.status}
                  priority={form.priority}
                  isActive={form.isActive}
                  canManageTask={canManageTask}
                  canEdit={canEdit}
                  isReadOnly={isReadOnly}
                  onStartDateChange={handleStartDateChange}
                  onDueDateChange={handleDueDateChange}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onActiveChange={handleActiveChange}
                />
              </div>

              {/* Danger zone */}
              {canManageTask && task.archiveSource !== "PROJECT" && (
                <div className="pt-2">
                  <label className="text-sm text-gray-500">
                    Danger zone
                  </label>

                  {/* Archive task */}
                  {task.archiveSource === null && (
                    <button
                      type="button"
                      onClick={() => setConfirmArchiveOpen(true)}
                      disabled={isArchiving || isUnarchiving || isDeleting}
                      className="
                          mt-1
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-md
                          bg-amber-100
                          px-3
                          py-2
                          text-amber-700
                          hover:bg-amber-200
                          disabled:opacity-50
                        "
                    >
                      <Archive className="size-4" />
                      Archive task
                    </button>
                  )}

                  {/* Unarchive task */}
                  {task.archiveSource === "MANUAL" && (
                    <button
                      type="button"
                      onClick={() => setConfirmUnarchiveOpen(true)}
                      disabled={isUnarchiving || isArchiving || isDeleting}
                      className="
                        mt-1
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-md
                        bg-green-100
                        px-3
                        py-2
                        text-green-700
                        hover:bg-green-200
                        disabled:opacity-50
                      "
                    >
                      <Archive className="size-4" />
                      Unarchive task
                    </button>
                  )}

                  {/* Delete task */}
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteOpen(true)}
                    disabled={isDeleting || isArchiving || isUnarchiving}
                    className="
                      mt-1
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-md
                      bg-red-100
                      px-3
                      py-2
                      text-red-600
                      hover:bg-red-200
                      disabled:opacity-50
                    "
                  >
                    <Trash2 className="size-4" />
                    Delete task
                  </button>
                </div>
              )}

              {/* Task Activity History (for desktop only) */}

              <div className="hidden lg:block">
                <TaskActivityHistory taskId={task.id} />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="shrink-0 border-t pt-4 text-xs text-gray-400">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Created on {createdAt.date}, {createdAt.time}
          </span>

          <span>
            Updated on {updatedAt.date}, {updatedAt.time}
          </span>
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchiveOpen}
        title="Archive task"
        description="Are you sure you want to archive this task? You can restore it later from the Archived tasks page."
        onCancel={() => setConfirmArchiveOpen(false)}
        onConfirm={() => archiveMutation.mutate()}
        loading={isArchiving}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete task"
        description="Are you sure you want to delete this task?"
        onCancel={() =>
          setConfirmDeleteOpen(false)
        }
        onConfirm={() =>
          deleteMutation.mutate()
        }
        loading={isDeleting}
      />

      <ConfirmDialog
        open={confirmUnarchiveOpen}
        title="Unarchive task"
        description="Are you sure you want to unarchive this task? It will be moved back to Active tasks."
        onCancel={() => setConfirmUnarchiveOpen(false)}
        onConfirm={() => unarchiveMutation.mutate()}
        loading={isUnarchiving}
      />
    </>
  );
}