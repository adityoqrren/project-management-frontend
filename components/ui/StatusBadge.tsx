import { ProjectStatus } from "@/types/project"

interface StatusBadgeProps {
  status: ProjectStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {

  const baseStyle =
    "px-3 py-1 text-xs font-medium rounded-full"

  const statusStyle = {
    ACTIVE: "bg-green-100 text-green-700",
    ON_HOLD: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    ARCHIVED: "bg-gray-100 text-gray-600"
  }

  const label = {
    ACTIVE: "Active",
    ON_HOLD: "On Hold",
    COMPLETED: "Completed",
    ARCHIVED: "Archived"
  }

  return (
    <span className={`${baseStyle} ${statusStyle[status]}`}>
      {label[status]}
    </span>
  )
}