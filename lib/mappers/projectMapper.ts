import { Project, ProjectResponse, Role } from "@/types/project";

export function mapProjectResponseToProject(
  project: ProjectResponse
): Project {
  return {
    id: project.projectId,
    name: project.name,
    role: project.role as Role,
    owner: project.owner,
    description: project.description,
    createdAt: project.createdAt, // keep UTC string, then change it to new Date() which automatically converts to local date in place where it will be used
    updatedAt: project.updatedAt,
    lastActivityAt: project.lastActivityAt,
    deletedAt: project.deletedAt,
  };
}