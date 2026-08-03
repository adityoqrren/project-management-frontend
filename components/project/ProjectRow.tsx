import { Project } from "@/types/project";
import Link from "next/link";
import { formatDateLocal } from "@/utils/formatter";
import ActionsMenu from "../common/ActionsMenu";
import { RotateCcw, Trash2 } from "lucide-react";

interface ProjectRowProps {
    project: Project;
    mode?: "active" | "deleted";

    onRestore?: (project: Project) => void;
    onPermanentDelete?: (project: Project) => void;
}

export default function ProjectRow({
    project,
    mode = "active",
    onPermanentDelete,
    onRestore
}: ProjectRowProps) {
    return (
        <tr className="border-b hover:bg-gray-50">

            {/* Name */}
            <td className="p-4">
                {mode === "active" ? (
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

            {/* Last Update / Deleted At */}
            <td className="p-4">
                {mode === "active"
                    ? formatDateLocal(project.lastActivityAt)
                    : project.deletedAt
                        ? formatDateLocal(project.deletedAt)
                        : "-"}
            </td>

            {/* Action */}
            {mode === "deleted" && (
                <td className="p-4 text-right">

                    <ActionsMenu
                        actions={[
                            {
                                label: "Restore",
                                icon: <RotateCcw className="size-4" />,
                                onClick: () => onRestore?.(project),
                            },
                            {
                                label: "Delete permanently",
                                icon: <Trash2 className="size-4" />,
                                variant: "destructive",
                                onClick: () => onPermanentDelete?.(project),
                            },
                        ]}
                    />

                </td>
            )}

        </tr>
    );
}