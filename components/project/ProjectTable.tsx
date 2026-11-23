import { Project } from "@/types/project";
import ProjectRow from "./ProjectRow";
import { useAuth } from "@/context/AuthContext";


interface ProjectsTableProps {
  projects: Project[];
  mode?: "active" | "archived" | "deleted";
  onUnarchive?: (project: Project) => void;
  onSoftDelete?: (project: Project) => void;
  onRestore?: (project: Project) => void;
  onPermanentDelete?: (project: Project) => void;
}

export default function ProjectsTable({
  projects,
  mode = "active",
  onUnarchive,
  onSoftDelete,
  onRestore,
  onPermanentDelete,
}: ProjectsTableProps) {
  const dateColumnLabel =
    mode === "active"
      ? "Last update"
      : mode === "archived"
        ? "Archived at"
        : "Deleted at";

  const { user } = useAuth();

  return (
    <div className="border rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[850px]">
        <thead className="border-b bg-gray-50 text-gray-500">
          <tr>
            <th className="text-left p-4">
              Name
            </th>

            <th className="text-left p-4">
              Role
            </th>

            <th className="text-left p-4">
              Created
            </th>

            <th className="text-left p-4">
              {dateColumnLabel}
            </th>

            {mode !== "active" && (
              <th className="text-right p-4">
                Action
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              mode={mode}
              onUnarchive={onUnarchive}
              onSoftDelete={onSoftDelete}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
            />))
          }
        </tbody>
      </table>
    </div>
  );
}
