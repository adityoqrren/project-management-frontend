"use client"

import { useMemo, useState } from "react"
import Modal from "@/components/ui/Modal"
import AssigneeSelector from "@/components/ui/AssigneeSelector"
import DateTimePicker from "@/components/ui/DateTimePicker"
import { Member } from "@/types/project"
import { Priority, Task, TaskStatus } from "@/types/task"
import ConfirmDialog from "../ui/ConfirmDialog"
import { ToastType, useToast } from "@/context/ToastContext"
import { assignTask, deleteTask, updateTask, updateTaskProgress } from "@/lib/task"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getProjectMembers } from "@/lib/project"
import { invalidateDashboard, invalidateDashboardTasks } from "@/lib/dashboard"
import { formatDateTimeLocal } from "@/utils/formatter"

// type Mode = "owner" | "member"

interface TaskDetailDialogProps {
  open: boolean
  onClose: () => void
  // mode: Mode
  task: Task
  canManageTask: boolean
  canUpdateProgress: boolean
  // onUpdate: (updatedTask: Task) => void
  // onDelete: (taskId: string) => void
}

export default function TaskDetailDialog({
  open,
  onClose,
  // mode,
  task,
  canManageTask,
  canUpdateProgress,
  // onUpdate,
  // onDelete
}: TaskDetailDialogProps) {

  const { showToast } = useToast()

  // State
  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority ?? "MEDIUM",
    assignee: task.assignee,
    startDate: task.startDate,
    dueDate: task.dueDate ?? "",
    isActive: task.isActive,
  })

  const { date: createdDate, time: createdTime } = formatDateTimeLocal(task.createdAt);
  const { date: updatedDate, time: updatedTime } = formatDateTimeLocal(task.updatedAt);
  // const [title, setTitle] = useState(task.title)
  // const [description, setDescription] = useState(
  //   "Review and finalize the homepage layout wireframes for the new website redesign project. Align with brand guidelines and stakeholder feedback."
  // )
  // const [assignee, setAssignee] = useState<User>(users[0])

  // const [startDate, setStartDate] = useState("2026-02-05T09:00")
  // const [dueDate, setDueDate] = useState("")

  const TASK_STATUS_OPTIONS: TaskStatus[] = [
    "TODO",
    "IN_PROGRESS",
    "DONE",
  ]

  // const [status, setStatus] = useState(task.status)
  // const [priority, setPriority] = useState(task.priority)

  // const [active, setActive] = useState(true)

  const [confirmOpen, setConfirmOpen] = useState(false)

  const queryClient = useQueryClient();

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ["projectMembers", task.project.id],
    queryFn: () => getProjectMembers(task.project.id),
  })

  const members: Member[] = useMemo(() => {
    return (
      membersData?.data.map((m) => ({
        memberId: m.memberId,
        userId: m.userId,
        name: m.name,
        role: m.role === "LEADER" ? "LEADER" : "MEMBER",
        isActive: m.isActive,
      })) ?? []
    );
  }, [membersData]);

  const updateTaskMutation = useMutation({
    mutationFn: async () => {
      if (canManageTask) {
        const res = await updateTask(task.id, {
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          startDate: form.startDate,
          dueDate: form.dueDate || undefined,
        });

        if (task.assignee?.memberId !== form.assignee?.memberId) {
          await assignTask(
            task.id,
            form.assignee?.memberId ?? null
          );
        }

        return res;
      }

      return updateTaskProgress(task.id, {
        status: form.status,
      });

    },

    onSuccess: async () => {
      showToast("Task updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["projectTasks", task.project.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["myTasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["task", task.id],
      });

      invalidateDashboard(queryClient)

      onClose();
    },

    onError: (error) => {
      console.error(error);

      showToast(
        "Failed to update task",
        ToastType.error
      );
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => deleteTask(task.id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projectTasks", task.project.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["myTasks"],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "deletedProjectTasks",
          task.project.id,
        ],
      });

      invalidateDashboard(queryClient)

      showToast("Task deleted successfully");

      setConfirmOpen(false);

      onClose();
    },

    onError: (error) => {
      console.error(error);

      showToast(
        "Failed to delete task",
        ToastType.error
      );
    },
  });

  const handleSave = () => {
    updateTaskMutation.mutate();
  }

  const handleDelete = () => {
    deleteTaskMutation.mutate();
  }

  const loading =
    updateTaskMutation.isPending ||
    deleteTaskMutation.isPending;

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className="
        w-full
        max-w-4xl
        max-h-[90vh]
        bg-white
        rounded-lg
        flex
        flex-col
        p-6
      ">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">

          <div>
            <p className="text-xs text-gray-400">TASK DETAIL</p>
            <h2 className="text-lg font-semibold">Project: {task.project.name}</h2>
          </div>

          <div className="flex gap-2 items-center">
            <button onClick={onClose} className="text-gray-500">
              Close
            </button>

            {(canManageTask || canUpdateProgress) && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-500 text-white px-3 py-1 rounded-md 
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed">
                {loading ? "Saving..." : "Save changes"}
              </button>
            )}
          </div>

        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-6">

          {/* LEFT SIDE */}
          <div className="space-y-4">

            {/* Title */}
            <div>
              <label className="text-sm text-gray-500">Task title</label>

              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))}
                disabled={!canManageTask}
                className="w-full border rounded-md px-3 py-2 mt-1 disabled:bg-gray-100
                focus:outline-none
                focus:ring-2 focus:ring-blue-400
                "
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-gray-500">Description</label>

              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                disabled={!canManageTask}
                className="w-full border rounded-md px-3 py-2 mt-1 disabled:bg-gray-100
                focus:outline-none
                focus:ring-2 focus:ring-blue-400
                "
                rows={4}
              />
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm text-gray-500">Assignee</label>

              <div className="mt-1">
                {canManageTask ? (
                  <AssigneeSelector
                    users={members}
                    value={form.assignee}
                    onChange={(member) =>
                      setForm((prev) => ({
                        ...prev,
                        assignee: member,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center gap-3 border rounded-md px-3 py-2 bg-gray-100">
                    {/* <img
                      src={form.assignee.avatar}
                      className="w-8 h-8 rounded-full"
                    /> */}
                    <div>
                      <p className="text-sm">
                        {form?.assignee?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Assigned to this task
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-4">

            {/* Dates */}
            <div>
              <label className="text-sm text-gray-500">Dates</label>

              <div className="bg-green-100 p-3 rounded-md mt-1 space-y-2">

                <DateTimePicker
                  label="Start date"
                  value={form.startDate}
                  onChange={(dateTime) =>
                    setForm((prev) => ({
                      ...prev,
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
                    setForm((prev) => ({
                      ...prev,
                      dueDate: dateTime,
                    }))
                  }
                  readonly={!canManageTask}
                />

              </div>
            </div>

            {/* Status (editable by both) */}
            <div>
              <label className="text-sm text-gray-500">Status</label>

              <select
                value={form.status}
                disabled={!canManageTask && !canUpdateProgress}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
                className="w-full border rounded-md px-3 py-2 mt-1"
              >
                {TASK_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm text-gray-500">Priority</label>

              {canManageTask ? (
                <select
                  value={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as Priority }))}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              ) : (
                <div className="bg-yellow-200 px-3 py-2 rounded-md mt-1 text-sm">
                  {form.priority}
                </div>
              )}
            </div>

            {/* Active State (owner only) */}
            {canManageTask && (
              <div>
                <label className="text-sm text-gray-500">Active state</label>

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setForm((prev) => ({ ...prev, isActive: true }))}
                    className={`px-3 py-1 rounded-md ${form.isActive ? "bg-gray-300" : "bg-gray-100"
                      }`}
                  >
                    Active
                  </button>

                  <button
                    onClick={() => setForm((prev) => ({ ...prev, isActive: false }))}
                    className={`px-3 py-1 rounded-md ${!form.isActive ? "bg-gray-300" : "bg-gray-100"
                      }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {canManageTask && (
              <div>
                <label className="text-sm text-gray-500">Danger zone</label>

                <button onClick={() => setConfirmOpen(true)} className="w-full bg-red-100 text-red-600 px-3 py-2 rounded-md mt-1">
                  Delete task
                </button>
              </div>
            )}

          </div>

        </div>

        {/* FOOTER */}
        <div className="text-xs text-gray-400 mt-6 border-t pt-3">
          Created on {createdDate} , {createdTime} <br />
          Last updated {updatedDate} , {updatedTime}
        </div>

      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
      />
    </Modal>
  )
}