import { Project } from "@/types/project";
import { formatDate } from "@/utils/formatter";

type ProjectHeaderProps = {
  project: Project,
};

export default function ProjectHeader({
  project,
}: ProjectHeaderProps) {

  const date = formatDate(project.createdAt);

  return (
    <div className="flex items-start justify-between gap-6 mb-6">

      <div className="flex-1">

        <h1 className="text-2xl font-semibold">
          {project.name}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Created {date}
        </p>

        {project.description ? (
          <p
            className="
              mt-4
              max-w-3xl
              text-gray-700
              whitespace-pre-wrap
              break-words
            "
          >
            {project.description}
          </p>
        ) : (
          <p
            className="
              mt-4
              italic
              text-gray-400
            "
          >
            No description yet.
          </p>
        )}

      </div>

    </div>
  );
}