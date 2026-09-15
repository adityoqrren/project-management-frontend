import { apiFetch } from "./api";
import { appendQueryParam } from "./utils";

type TaskActivityType =
  | "task.created"
  | "task.updated"
  | "task.assigned"
  | "task.completed"
  | "task.deleted"
  | "task.attachment.added"
  | "task.attachment.deleted"
  | "task.comment.created"
  | "task.comment.updated"
  | "task.comment.deleted";

export interface TaskActivityLog {
  id: string;
  type: TaskActivityType;
  message: string;
  createdAt: string;
  actorId: string;
  actorName: string;
  targetUserId: string | null;
  targetUserName: string | null;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
}

export interface ActivityLogPagination {
  limit: number;
  nextCursor: string | null;
}

export interface GetTaskActivityLogsApiResponse {
  status: string;
  data: TaskActivityLog[];
  pagination: ActivityLogPagination;
}

export type GetTaskActivityLogsParams = {
  cursor?: string;
  limit?: number;
};

export async function getTaskActivityLogs(
  taskId: string,
  params?: GetTaskActivityLogsParams
) {
  const query = new URLSearchParams();

  appendQueryParam(query, "cursor", params?.cursor);
  appendQueryParam(query, "limit", params?.limit);

  return apiFetch<GetTaskActivityLogsApiResponse>(
    `/api/activity-logs/tasks/${taskId}?${query.toString()}`
  );
}