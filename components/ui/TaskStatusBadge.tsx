import { TaskStatusBadgeProps } from "@/types/task"

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {

  const baseStyle =
    "inline-flex w-24 px-3 py-1 text-xs font-medium rounded-full justify-center flex-wrap"

  const statusStyle = {
    TODO: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    DONE: "bg-green-100 text-green-700"
  }

  const taskStatusLabel = {
    TODO: "Todo",
    IN_PROGRESS: "In Progress",
    DONE: "Done"
  }

  return (
    <span className={`${baseStyle} ${statusStyle[status]}`}>
      {taskStatusLabel[status]}
    </span>
  )
}