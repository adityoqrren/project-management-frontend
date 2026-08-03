import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Project } from "@/types/project";

interface DashboardProjectsProps {
  projects: Project[];
  loading: boolean;
  error: Error | null;
}

export default function DashboardProjects({
  projects,
  loading,
  error,
}: DashboardProjectsProps) {

  if (loading) {
    return (
      <section className="space-y-4">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-semibold">
              My Projects
            </h2>

            <p className="text-sm text-gray-500">
              Your recently active projects
            </p>

          </div>

        </div>

        <div className="rounded-xl border bg-white">

          {Array.from({ length: 5 }).map((_, index) => (

            <div
              key={index}
              className="
                h-20
                border-b
                last:border-b-0
                animate-pulse
                bg-gray-50
              "
            />

          ))}

        </div>

      </section>
    );
  }

  if (error) {
    return (
      <section>

        <h2 className="text-2xl font-semibold">
          My Projects
        </h2>

        <div className="mt-4 text-red-500">
          Failed to load projects.
        </div>

      </section>
    );
  }

  return (
    <section className="space-y-4">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-semibold">
            My Projects
          </h2>

          <p className="text-sm text-gray-500">
            Your recently active projects
          </p>

        </div>

        <Link
          href="/projects"
          className="
            text-sm
            text-green-600
            hover:text-green-700
            font-medium
          "
        >
          View All →
        </Link>

      </div>

      {projects.length === 0 ? (

        <div
          className="
            rounded-xl
            border
            bg-white
            py-10
            text-center
            text-gray-400
          "
        >
          No projects yet.
        </div>

      ) : (

        <div className="rounded-xl border bg-white divide-y overflow-hidden">

          {projects.map((project) => (

            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="
                flex
                items-center
                justify-between
                px-5
                py-4
                hover:bg-gray-100
                transition-colors
              "
            >

              <div>

                <div className="font-medium">
                  {project.name}
                </div>

                <div className="mt-1 text-sm text-gray-500">

                  Last activity{" "}

                  {formatDistanceToNow(
                    new Date(project.lastActivityAt),
                    {
                      addSuffix: true,
                    }
                  )}

                </div>

              </div>

              <span
                className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-medium

                  ${
                    project.role === "LEADER"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }
                `}
              >
                {project.role === "LEADER"
                  ? "Leader"
                  : "Member"}
              </span>

            </Link>

          ))}

        </div>

      )}

    </section>
  );
}