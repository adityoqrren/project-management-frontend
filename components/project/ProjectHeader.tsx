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
          <div
            className="
              prose
              prose-sm
              max-w-none
              text-gray-900
              prose-headings:text-gray-900
              prose-p:my-1
              prose-ul:my-2
              prose-ol:my-2
              prose-li:my-0
              prose-blockquote:my-3
              prose-a:text-blue-600
              prose-a:underline
              hover:prose-a:text-blue-700
            "
            dangerouslySetInnerHTML={{
              __html: project.description,
            }}
          />
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