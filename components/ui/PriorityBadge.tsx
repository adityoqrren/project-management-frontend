import { PriorityBadgeProps } from "@/types/task"

export default function PriorityBadge({ priority }: PriorityBadgeProps) {

  const baseStyle =
    "px-3 py-1 text-xs font-medium rounded-full"

  const priorityStyle = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-gray-100 text-gray-700"
  }

  return (
    <span className={`${baseStyle} ${priorityStyle[priority]}`}>
      {priority}
    </span>
  )
}