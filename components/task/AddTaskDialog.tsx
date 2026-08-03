"use client"

import { useState } from "react"
import DateTimePicker from "../ui/DateTimePicker"
import Modal from "../ui/Modal"
import { Member, User } from "@/types/project"
import AssigneeSelector from "../ui/AssigneeSelector"
import { Priority, Task, TaskStatus } from "@/types/task"
import { title } from "process"
import { useToast } from "@/context/ToastContext"
import { createTask } from "@/lib/task"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invalidateDashboard } from "@/lib/dashboard"

interface AddTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
}

type AddTaskForm = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: Member | null;
  startDate: string;
  dueDate: string;
};

export default function AddTaskDialog({
  isOpen,
  onClose,
  projectId,
  projectName,
}: AddTaskDialogProps) {

  const { showToast } = useToast()

  // State
  const [form, setForm] = useState<AddTaskForm>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assignee: null,
    startDate: "",
    dueDate: "",
  })

  const [errors, setErrors] = useState({
    startDate: "",
    title: "",
  })

  const TASK_STATUS_OPTIONS: TaskStatus[] = [
    "TODO",
    "IN_PROGRESS",
    "DONE",
  ]

  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: createTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectTasks", projectId],
      });

      showToast("Task added");

      invalidateDashboard(queryClient);

      handleClose();
    },

    onError: (error) => {
      console.error(error);

      showToast(
        "Failed to create task",
        "error"
      );
    },
  });

  const handleSubmit = async () => {
    const newErrors = {
      title: "",
      startDate: "",
    }

    if (!form.title.trim()) {
      newErrors.title = "Title is required"
    }

    console.log(`startDate: ${form.startDate}`)

    const date = form.startDate?.split("T")[0] || ""
    // const time = form.startDate?.split("T")[1] || ""

    if (!date) {
      newErrors.startDate = "Start date is required"
    }

    setErrors(newErrors)

    // kalau ada error → stop
    if (newErrors.startDate || newErrors.title) return

    createTaskMutation.mutate({
      title: form.title,
      description: form.description,
      projectId,
      status: form.status,
      priority: form.priority,
      startDate: form.startDate,
      dueDate: form.dueDate || undefined,
    });
  }

  const handleClose = () => {
    // reset all states here
    setForm({
      title: "",
      description: "",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      assignee: null,
      startDate: "",
      dueDate: "",
    })
    //call onClose
    onClose()
  }

  const loading = createTaskMutation.isPending;

  if (!isOpen) return null

  return (

    //{/* Dialog Card */}

    <Modal isOpen={isOpen} onClose={handleClose}>

      <div className="w-[760px] p-6">

        {/* HEADER */}

        <div className="flex justify-between items-start mb-6">

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              New Task
            </p>

            <h2 className="text-lg font-semibold">
              Project: {projectName}
            </h2>
          </div>

          <div className="flex items-center gap-4">

            <button
              onClick={
                handleClose
              }
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>

            <button onClick={handleSubmit}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            ">
              {loading ? "Saving..." : "Save changes"}
            </button>

          </div>

        </div>

        {/* FORM */}

        <div className="grid grid-cols-2 gap-8">

          {/* LEFT COLUMN */}

          <div className="space-y-4">

            {/* Task Title */}

            <div>
              <label className="text-sm text-gray-500">
                Task title
              </label>

              <input
                value={form.title}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))

                  if (errors.title) {
                    setErrors((prev) => ({
                      ...prev,
                      title: "",
                    }))
                  }
                }}
                className={`
                  w-full border rounded-md px-3 py-2 mt-1 text-sm
                  focus:outline-none
                  focus:ring-2 focus:ring-blue-400
                  ${errors.title ? "border-red-500" : ""}
                `}
                placeholder="Finalize homepage layout wireframes"
              />

              {/* ERROR MESSAGE */}
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}

            <div>
              <label className="text-sm text-gray-500">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm
                focus:outline-none
                focus:ring-2 focus:ring-blue-400
                "
                placeholder="Task description..."
              />
            </div>

            {/* Assignee */}
            {/* 
            <div>
              <label className="text-sm text-gray-500">
                Assignee
              </label>

              <AssigneeSelector
                users={projectMembers}
                value={form.assignee}
                onChange={
                  (user) =>
                    setForm((prev) => ({
                      ...prev,
                      assignee: user,
                    }))
                }
              />
            </div> */}

          </div>

          {/* RIGHT COLUMN */}

          <div className="space-y-4">

            {/* Dates */}

            <div>

              <p className="text-sm text-gray-500 mb-1">
                Dates
              </p>

              <div className="bg-green-100 rounded-md p-3 text-sm space-y-2">

                <DateTimePicker
                  label="Start date"
                  value={form.startDate}
                  onChange={(dateTime) => {
                    setForm((prev) => ({
                      ...prev,
                      startDate: dateTime,
                    }))

                    setErrors((prev) => ({
                      ...prev,
                      startDate: "",
                    }))
                  }
                  }
                  error={errors.startDate}
                  required
                />

                <DateTimePicker
                  label="Due date"
                  value={form.dueDate}
                  onChange={(dateTime) =>
                    setForm((prev) => ({
                      ...prev,
                      dueDate: dateTime,
                    }))}
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
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
                className="w-full bg-blue-500 text-white rounded-md px-3 py-2 mt-1 text-sm">

                {TASK_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}

              </select>

            </div>

            {/* Priority */}

            <div>

              <label className="text-sm text-gray-500">
                Priority
              </label>

              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as Priority }))}
                className="w-full bg-yellow-400 text-black rounded-md px-3 py-2 mt-1 text-sm">

                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>

              </select>

            </div>

          </div>

        </div>

      </div>

    </Modal>

  )
}