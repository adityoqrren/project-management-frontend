import Link from "next/link"
import PriorityBadge from "../ui/PriorityBadge"
import TaskStatusBadge from "../ui/TaskStatusBadge"
import { Task } from "@/types/task"
import { formatDateLocal } from "@/utils/formatter"
import { RotateCcw, Trash2 } from "lucide-react"
import ActionsMenu from "../common/ActionsMenu"


interface TaskRowProps {
  task: Task;
  mode?: "active" | "archived" | "deleted";
  isProjectArchived?: boolean;
  canManageTask?: boolean;

  getTaskHref?: (task: Task) => string;
  onRestore?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onPermanentDelete?: (task: Task) => void;
}

export default function TaskRow({
  task,
  mode = "active",
  isProjectArchived,
  canManageTask,
  getTaskHref,
  onRestore,
  onDelete,
  onPermanentDelete,
}: TaskRowProps) {
  const dateLabel =
    mode === "archived" ? task.archivedAt : task.deletedAt;

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4">
        {mode === "active" || mode === "archived" ? (
          <Link
            href={getTaskHref?.(task) ?? `/projects/${task.project.id}/tasks/${task.id}`}
            className="text-left text-blue-600 hover:underline"
          >
            {task.title}
          </Link>
        ) : (
          <div className="space-y-1">
            <span>{task.title}</span>
            <div>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${task.archiveSource === "MANUAL"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
                  }`}
              >
                Originally{" "}
                {task.archiveSource === "MANUAL" ? "Archived" : "Active"}
              </span>
            </div>
          </div>
        )}
      </td>

      <td className="p-4">{task.project.name}</td>

      <td className="p-4">
        {task.assignee != null ? task.assignee.name : "unassigned"}
      </td>

      <td className="p-4 text-sm text-gray-600">
        {task.startDate ? formatDateLocal(task.startDate) : "-"}
      </td>

      <td className="p-4 text-sm text-gray-600">
        {task.dueDate ? formatDateLocal(task.dueDate) : "-"}
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
            {dateLabel ? formatDateLocal(dateLabel) : "-"}
          </td>

          <td className="p-4 text-right">
            {!isProjectArchived && canManageTask && (
              <ActionsMenu
                actions={[
                  {
                    label: "Restore",
                    icon: <RotateCcw className="size-4" />,
                    onClick: () => onRestore?.(task),
                  },
                  ...(mode === "archived"
                    ? [
                      {
                        label: "Delete",
                        icon: <Trash2 className="size-4" />,
                        variant: "destructive" as const,
                        onClick: () => onDelete?.(task),
                      },
                    ]
                    : [
                      {
                        label: "Delete permanently",
                        icon: <Trash2 className="size-4" />,
                        variant: "destructive" as const,
                        onClick: () => onPermanentDelete?.(task),
                      },
                    ]),
                ]}
              />
            )}
          </td>
        </>
      )}
    </tr>
  );
}
