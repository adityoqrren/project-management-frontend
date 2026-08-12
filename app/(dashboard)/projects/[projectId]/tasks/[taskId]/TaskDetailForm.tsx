"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { useToast } from "@/context/ToastContext";

import {
  assignTask,
  deleteTask,
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


interface TaskDetailFormProps {
  task: Task;
  members: Member[];
  canManageTask: boolean;
  canUpdateProgress: boolean;
}

export default function TaskDetailForm({
  task,
  members,
  canManageTask,
  canUpdateProgress,
}: TaskDetailFormProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [confirmDeleteOpen, setConfirmDeleteOpen] =
    useState(false);

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
        "error"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projectTasks", task.project.id],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "deletedProjectTasks",
          task.project.id,
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: ["myTasks"],
      });

      invalidateDashboard(queryClient);

      showToast("Task deleted successfully");

      setConfirmDeleteOpen(false);
    },

    onError: (error) => {
      console.error(error);

      showToast(
        "Failed to delete task",
        "error"
      );
    },
  });

  const canEdit =
    canManageTask || canUpdateProgress;

  const isSaving =
    updateMutation.isPending;

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
            </div>

            {canEdit && (
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
                  disabled={!canManageTask}
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

                <textarea
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
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="text-sm text-gray-500">
                  Assignee
                </label>

                <div className="mt-1">
                  {canManageTask ? (
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

            </div>

            {/* Right column */}
            <div className="space-y-5">

              {/* Dates */}
              <div>
                <label className="text-sm text-gray-500">
                  Dates
                </label>

                <div className="mt-1 space-y-2 rounded-md bg-green-100 p-3">

                  <DateTimePicker
                    label="Start date"
                    value={form.startDate}
                    onChange={(dateTime) =>
                      setForm((previous) => ({
                        ...previous,
                        startDate: dateTime,
                      }))
                    }
                    required
                    readonly={!canManageTask}
                  />

                  <DateTimePicker
                    label="Due date"
                    value={form.dueDate}
                    onChange={(dateTime) =>
                      setForm((previous) => ({
                        ...previous,
                        dueDate: dateTime,
                      }))
                    }
                    readonly={!canManageTask}
                  />

                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-gray-500">
                  Status
                </label>

                <select
                  value={form.status}
                  disabled={!canEdit}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      status:
                        event.target.value as TaskStatus,
                    }))
                  }
                  className="
                  mt-1
                  w-full
                  rounded-md
                  border
                  px-3
                  py-2
                  disabled:bg-gray-100
                "
                >
                  <option value="TODO">
                    Todo
                  </option>

                  <option value="IN_PROGRESS">
                    In Progress
                  </option>

                  <option value="DONE">
                    Done
                  </option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm text-gray-500">
                  Priority
                </label>

                {canManageTask ? (
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        priority:
                          event.target.value as Priority,
                      }))
                    }
                    className="
                    mt-1
                    w-full
                    rounded-md
                    border
                    px-3
                    py-2
                  "
                  >
                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>
                  </select>
                ) : (
                  <div className="mt-1 rounded-md bg-yellow-200 px-3 py-2 text-sm">
                    {form.priority}
                  </div>
                )}
              </div>

              {/* Active state */}
              {canManageTask && (
                <div>
                  <label className="text-sm text-gray-500">
                    Active state
                  </label>

                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          isActive: true,
                        }))
                      }
                      className={`
                      rounded-md
                      px-3
                      py-1
                      ${form.isActive
                          ? "bg-gray-300"
                          : "bg-gray-100"
                        }
                    `}
                    >
                      Active
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          isActive: false,
                        }))
                      }
                      className={`
                      rounded-md
                      px-3
                      py-1
                      ${!form.isActive
                          ? "bg-gray-300"
                          : "bg-gray-100"
                        }
                    `}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              )}

              {/* Danger zone */}
              {canManageTask && (
                <div className="pt-2">
                  <label className="text-sm text-gray-500">
                    Danger zone
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDeleteOpen(true)
                    }
                    disabled={isDeleting}
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

            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-8">
          {/* Comments will be implemented here */}
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
    </>
  );
}