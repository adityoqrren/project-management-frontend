import { Project } from "@/types/project";
import ProjectRow from "./ProjectRow";

interface ProjectsTableProps {
  projects: Project[];
  mode?: "active" | "deleted";
  onRestore?: (project: Project) => void;

  onPermanentDelete?: (project: Project) => void;
}

export default function ProjectsTable({
  projects,
  mode = "active",
  onRestore,
  onPermanentDelete
}: ProjectsTableProps) {
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
              {mode === "active"
                ? "Last update"
                : "Deleted at"}
            </th>

            {mode === "deleted" && (
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
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
            />
          ))}

        </tbody>

      </table>

    </div>
  );
}