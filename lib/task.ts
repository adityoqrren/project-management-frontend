import { Role } from "@/types/project";
import { ApiTask, MyTaskCounts, Priority } from "@/types/task";
import { toLocalInput, toUtc } from "@/utils/date";
import { apiFetch } from "./api";
import { mapTaskFromApi } from "./mappers/taskMapper";
import { appendQueryParam } from "./utils";

type GetMyTasksParams = {
  search?: string;
  projectId?: string;
  priority?: string;
  taskStatus?: string;
  dueFilter?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number
};

export type GetProjectTasksParams = {
  search?: string;
  assignee?: string;
  taskStatus?: string;
  priority?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export interface ApiPagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasPrev: boolean;
  hasNext: boolean;
}

interface GetProjectTasksApiResponse {
  status: string;
  data: ApiTask[];
  pagination: ApiPagination;
}

async function getProjectTasksRaw(
  url: string
) {
  await new Promise((resolve) =>
    setTimeout(resolve, 3000)
  );
  return apiFetch<GetProjectTasksApiResponse>(
    url
  );
}

// Get tasks with assignee included
export async function getProjectTasks(
  projectId: string,
  params?: GetProjectTasksParams
) {
  const searchParams =
    new URLSearchParams();

  searchParams.set("include", "assignee");

  appendQueryParam(searchParams, "search", params?.search);
  appendQueryParam(searchParams, "assignee", params?.assignee);
  appendQueryParam(searchParams, "taskStatus", params?.taskStatus);
  appendQueryParam(searchParams, "priority", params?.priority);
  appendQueryParam(searchParams, "sortBy", params?.sortBy);
  appendQueryParam(searchParams, "order", params?.order);
  appendQueryParam(searchParams, "page", params?.page);
  appendQueryParam(searchParams, "limit", params?.limit);

  const res = await getProjectTasksRaw(
    `/api/projects/${projectId}/tasks?${searchParams.toString()}`
  );

  return {
    ...res,
    data: res.data.map(mapTaskFromApi),
  };
}

// Get current user assigned tasks
export async function getMyTasks(
  params?: GetMyTasksParams
) {
  const query = new URLSearchParams();

  query.set("include", "assignee");

  appendQueryParam(query, "search", params?.search);
  appendQueryParam(query, "projectId", params?.projectId);
  appendQueryParam(query, "taskStatus", params?.taskStatus);
  appendQueryParam(query, "priority", params?.priority);
  appendQueryParam(query, "sortBy", params?.sortBy);
  appendQueryParam(query, "order", params?.order);
  appendQueryParam(query, "dueFilter", params?.dueFilter);
  appendQueryParam(query, "page", params?.page);
  appendQueryParam(query, "limit", params?.limit);

  const res = await getProjectTasksRaw(
    `/api/tasks/me?${query.toString()}`
  );

  return {
    ...res,
    data: res.data.map(mapTaskFromApi),
  };
}

export async function getTaskById(
  taskId: string
) {
  const res = await apiFetch<{
    status: string;
    data: ApiTask;
  }>(
    `/api/tasks/${taskId}`
  );

  return {
    ...res,
    data: mapTaskFromApi(res.data),
  };
}

export async function getMyTaskCounts() {
  return apiFetch<{
    status: string;
    counts: MyTaskCounts;
  }>("/api/tasks/me/counts");
}

export async function getRecentProjectTasks(
  projectId: string,
  limit = 5
) {
  const result = await apiFetch<{
    status: string;
    totalRecent: number;
    data: ApiTask[];
  }>(
    `/api/projects/${projectId}/tasks/recent?limit=${limit}`
  );

  return {
    ...result,
    data: result.data.map(mapTaskFromApi),
  };
}

export async function createTask(data: {
  title: string;
  description?: string;
  projectId: string;
  status: string;
  priority: Priority;
  startDate: string;
  dueDate?: string;
}) {
  return apiFetch<{
    status: string;
    message: string;
    data: {
      taskId: string;
      projectId: string;
    };
  }>("/api/tasks", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      startDate: toUtc(
        data.startDate
      ),

      dueDate: data.dueDate
        ? toUtc(data.dueDate)
        : undefined,
    }),
  });
}

// Update task
export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: string
    priority?: Priority
    startDate?: string
    dueDate?: string
  }
) {
  const res = await apiFetch<{
    status: string;
    message: string;
    data: {
      taskId: string;
      projectId: string;
      title: string;
      description: string;
      picId: string | null;
      completed: boolean;
      priority: Priority
      startDate: string
      dueDate?: string
    };
  }>(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...data,
      startDate: data.startDate
        ? toUtc(data.startDate)
        : undefined,

      dueDate: data.dueDate
        ? toUtc(data.dueDate)
        : undefined,
    }),
  });

  return {
    ...res,

    data: {
      ...res.data,

      startDate: res.data.startDate
        ? toLocalInput(
          res.data.startDate
        )
        : "",

      dueDate: res.data.dueDate
        ? toLocalInput(
          res.data.dueDate
        )
        : "",
    }
  }
}

// Update task progress
export async function updateTaskProgress(
  taskId: string,
  data: {
    description?: string;
    status?: string
  }
) {
  return apiFetch<{
    status: string;
    message: string;
    data: {
      taskId: string;
      projectId: string;
      title: string;
      description: string;
      picId: string | null;
      completed: boolean;
    };
  }>(`/api/tasks/${taskId}/progress`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Assign member to task
export async function assignTask(
  taskId: string,
  memberId: string | null
) {
  return apiFetch<{
    status: string;
    message: string;
    data: {
      taskId: string;
      memberId: string | null;
    };
  }>(`/api/tasks/${taskId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({
      memberId,
    }),
  });
}

// Soft delete task
export async function deleteTask(taskId: string) {
  return apiFetch<{
    status: string;
    message: string;
  }>(`/api/tasks/${taskId}/soft-delete`, {
    method: "PATCH",
  });
}

// get soft deleted project tasks
export async function getDeletedProjectTasks(
  projectId: string,
  params?: GetProjectTasksParams
) {
  const searchParams =
    new URLSearchParams();

  searchParams.set("status", "deleted");
  searchParams.set("include", "assignee");

  appendQueryParam(searchParams, "search", params?.search);
  appendQueryParam(searchParams, "assignee", params?.assignee);
  appendQueryParam(searchParams, "taskStatus", params?.taskStatus);
  appendQueryParam(searchParams, "priority", params?.priority);
  appendQueryParam(searchParams, "sortBy", params?.sortBy);
  appendQueryParam(searchParams, "order", params?.order);
  appendQueryParam(searchParams, "page", params?.page);
  appendQueryParam(searchParams, "limit", params?.limit);

  const res = await getProjectTasksRaw(
    `/api/projects/${projectId}/tasks?${searchParams.toString()}`
  );

  return {
    ...res,
    data: res.data.map(mapTaskFromApi),
  };
}

//restore soft deleted task
export async function restoreTask(
  taskId: string
) {
  return apiFetch<{
    status: string;
    message: string;
  }>(
    `/api/tasks/restore/${taskId}`,
    {
      method: "PATCH",
    }
  );
}

//delete permanently soft deleted task
export async function permanentlyDeleteTask(
  taskId: string
) {
  return apiFetch(
    `/api/tasks/${taskId}`,
    {
      method: "DELETE",
    }
  );
}