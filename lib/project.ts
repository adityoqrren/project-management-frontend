import { Member, Project, ProjectCreation, ProjectResponse, Role } from "@/types/project";
import { apiFetch } from "./api";
import { mapProjectResponseToProject } from "./mappers/projectMapper";

export type GetProjectsParams = {
  status?: "active" | "deleted" | "all" //all | active | deleted -> default in server is active
  search?: string;
  role?: string;
  sortBy?: string; // default in server is by createdAt
  order?: "asc" | "desc"; // default in server is desc
  limit?: number;
};

export type ProjectStatistics = {
  status?: string;
  totalTasks: number;
  todo: number;
  inProgress: number;
  done: number;
};

export async function getProjects(
  params?: GetProjectsParams
) {
  const queryParams =
    new URLSearchParams();

  queryParams.set(
    "memberStatus",
    "active"
  );

  if (params?.status) {
    queryParams.set(
      "status",
      params.status
    );
  }

  if (params?.search) {
    queryParams.set(
      "search",
      params.search
    );
  }

  if (params?.role) {
    queryParams.set(
      "role",
      params.role
    );
  }

  if (params?.sortBy) {
    queryParams.set(
      "sortBy",
      params.sortBy
    );
  }

  if (params?.order) {
    queryParams.set(
      "order",
      params.order
    );
  }

  if (params?.limit) {
    queryParams.set(
      "limit",
      params.limit.toString()
    );
  }

  const result = await apiFetch<{
    status: string;
    data: ProjectResponse[];
  }>(
    `/api/projects?${queryParams.toString()}`
  );

  return {
    status: result.status,
    data: result.data.map(
      mapProjectResponseToProject
    ),
  };
}

export async function createProject(data: { name: string, description: string }) {
  return apiFetch<{
    status: string;
    message: string;
    data: {
      projectId: string;
      name: string;
    };
  }>("/api/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Get single project by id
export async function getProjectById(projectId: string) {
  const result = await apiFetch<{
    status: string;
    data: ProjectResponse;
  }>(`/api/projects/${projectId}`);

  return {
    status: result.status,
    data: 
      mapProjectResponseToProject(result.data)
    ,
  };
}

// Get project members
export async function getProjectMembers(projectId: string) {
  return apiFetch<{
    status: string;
    data: Member[];
  }>(`/api/projects/${projectId}/members`);
}

// Add member to project
export async function addProjectMember(data: {
  userId: string;
  projectId: string;
}) {
  return apiFetch<{
    status: string;
    message: string;
  }>("/api/projects/members", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMemberActiveStatus(
  projectId: string,
  memberId: string,
  isActive: boolean
) {
  return apiFetch(
    `/api/projects/${projectId}/members/${memberId}/active`,
    {
      method: "PATCH",
      body: JSON.stringify({
        isActive,
      }),
    }
  )
}

export async function getProjectStatistics(
  projectId: string
) {
  return apiFetch<{
    status: string;
    projectId: string;
    statistics: ProjectStatistics;
  }>(
    `/api/projects/${projectId}/statistics`
  );
}

export async function updateProject(
  projectId: string,
  project: ProjectCreation
) {
  return apiFetch<{
    status: string;
    message: string;
  }>(`/api/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(project),
  });
}

export async function softDeleteProject(
  projectId: string
) {
  return apiFetch<{
    status: string;
    message: string;
  }>(`/api/projects/${projectId}/soft-delete`, {
    method: "PATCH",
  });
}

export async function restoreProject(
  projectId: string
) {
  return apiFetch<{
    status: string;
    message: string;
  }>(
    `/api/projects/${projectId}/restore`,
    {
      method: "PATCH",
    }
  );
}

export async function permanentlyDeleteProject(
  projectId: string
) {
  return apiFetch<{
    status: string;
    message: string;
  }>(
    `/api/projects/${projectId}`,
    {
      method: "DELETE",
    }
  );
}