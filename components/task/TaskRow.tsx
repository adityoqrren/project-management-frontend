import Link from "next/link"
import PriorityBadge from "../ui/PriorityBadge"
import TaskStatusBadge from "../ui/TaskStatusBadge"
import { Task } from "@/types/task"
import { formatDateLocal } from "@/utils/formatter"
import { RotateCcw, Trash2 } from "lucide-react"
import ActionsMenu from "../common/ActionsMenu"

interface TaskRowProps {
  task: Task,
  mode?: "active" | "deleted";

  onOpenTask?: (task: Task) => void;

  onRestore?: (task: Task) => void;

  onPermanentDelete?: (task: Task) => void;
}

export default function TaskRow({ task, mode, onOpenTask, onRestore, onPermanentDelete }: TaskRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">

      <td className="p-4">
        {mode === "active" ? (
          <button
            onClick={() => onOpenTask?.(task)}
            className="text-blue-600 hover:underline text-left"
          >
            {task.title}
          </button>
        ) : (
          <span>{task.title}</span>
        )}
      </td>

      <td className="p-4">
        {task.project.name}
      </td>

      <td className="p-4">
        {task.assignee != null ? task.assignee.name : 'unassigned'}
      </td>

      <td className="p-4 text-sm text-gray-600">
        {task.startDate
          ? formatDateLocal(task.startDate)
          : "-"
        }
      </td>

      <td className="p-4 text-sm text-gray-600">
        {task.dueDate
          ? formatDateLocal(task.dueDate)
          : "-"
        }
      </td>

      <td className="p-4">
        <PriorityBadge priority={task.priority} />
      </td>

      {mode === "active" ? (
        <td className="p-4">
          <TaskStatusBadge status={task.status} />
        </td>
      ) : (
        <>
          <td className="p-4 text-sm text-gray-600">
            {task.deletedAt
              ? formatDateLocal(task.deletedAt)
              : "-"}
          </td>

          <td className="p-4 text-right">

            <ActionsMenu
              actions={[
                {
                  label: "Restore",
                  icon: <RotateCcw className="size-4" />,
                  onClick: () => onRestore?.(task),
                },
                {
                  label: "Delete permanently",
                  icon: <Trash2 className="size-4" />,
                  variant: "destructive",
                  onClick: () => onPermanentDelete?.(task),
                },
              ]}
            />

          </td>
        </>
      )}

    </tr>
  )
}