import { Project } from "@/types/project";
import Link from "next/link";
import { formatDateLocal } from "@/utils/formatter";
import ActionsMenu from "../common/ActionsMenu";
import { RotateCcw, Trash2 } from "lucide-react";


interface ProjectRowProps {
  project: Project;
  mode?: "active" | "archived" | "deleted";
  onUnarchive?: (project: Project) => void;
  onSoftDelete?: (project: Project) => void;
  onRestore?: (project: Project) => void;
  onPermanentDelete?: (project: Project) => void;
}

export default function ProjectRow({
  project,
  mode = "active",
  onUnarchive,
  onSoftDelete,
  onRestore,
  onPermanentDelete,
}: ProjectRowProps) {
  const isOwner = project.role === "LEADER";

  const canOpenProject = mode !== "deleted";

  const projectDate =
    mode === "active"
      ? project.lastActivityAt
      : mode === "archived"
        ? project.archivedAt
        : project.deletedAt;

  const actions =
    mode === "archived"
      ? [
        {
          label: "Unarchive",
          icon: <RotateCcw className="size-4" />,
          onClick: () => onUnarchive?.(project),
        },
        {
          label: "Delete",
          icon: <Trash2 className="size-4" />,
          variant: "destructive" as const,
          onClick: () => onSoftDelete?.(project),
        },
      ]
      : [
        {
          label: "Restore",
          icon: <RotateCcw className="size-4" />,
          onClick: () => onRestore?.(project),
        },
        {
          label: "Delete permanently",
          icon: <Trash2 className="size-4" />,
          variant: "destructive" as const,
          onClick: () => onPermanentDelete?.(project),
        },
      ];

  return (
    <tr className="border-b hover:bg-gray-50">
      {/* Name */}
      <td className="p-4">
        {canOpenProject ? (
          <Link
            href={`/projects/${project.id}`}
            className="text-blue-600 hover:underline"
          >
            {project.name}
          </Link>
        ) : (
          <span>{project.name}</span>
        )}
      </td>

      {/* Role */}
      <td className="p-4">
        {project.role}
      </td>

      {/* Created */}
      <td className="p-4">
        {formatDateLocal(project.createdAt)}
      </td>

      {/* Last Update / Archived At / Deleted At */}
      <td className="p-4">
        {projectDate
          ? formatDateLocal(projectDate)
          : "-"}
      </td>

      {/* Action */}
      {mode !== "active" ? (
        <td className="p-4 text-right">
          {isOwner ? <ActionsMenu actions={actions} /> : "-"}
        </td>
      ) : null}
    </tr>
  );
}
