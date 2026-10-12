import { Project } from "@/types/project";

interface GeneralSettingsCardProps {
  project: Project;
  onEdit: () => void;
}

export default function GeneralSettingsCard({
  project,
  onEdit
}: GeneralSettingsCardProps) {
  return (
    <section className="border rounded-xl p-6">

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-lg font-semibold">
            General
          </h2>

          <p className="text-sm text-gray-500">
            Basic information about this project.
          </p>
        </div>

        <button
          className="
            px-4
            py-2
            rounded-md
            border
            hover:bg-gray-50
          "
          onClick={onEdit}
        >
          Edit
        </button>

      </div>

      <div className="space-y-6">

        <div>

          <p className="text-sm text-gray-500">
            Project Name
          </p>

          <p className="mt-1 font-medium">
            {project.name}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Description
          </p>

          <div className="mt-1 whitespace-pre-wrap">
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

      </div>

    </section>
  );
}