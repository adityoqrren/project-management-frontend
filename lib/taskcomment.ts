import { apiFetch } from "@/lib/api";
import { appendQueryParam } from "./utils";

export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface CommentPagination {
  total: number;
  limit: number;
  nextCursor: string;
}

export interface GetTaskCommentsApiResponse {
  status: string;
  data: TaskComment[];
  pagination: CommentPagination;
}

interface CreateTaskCommentApiResponse {
  status: string;
  message: string;
  data: TaskComment;
}

interface UpdateTaskCommentApiResponse {
  status: string;
  message: string;
  data: TaskComment;
}

interface DeleteTaskCommentApiResponse {
  status: string;
  message: string;
}

export type GetTaskCommentsParams = {
  cursor?: string;
  limit?: number;
};

export async function getTaskComments(
  taskId: string,
  params?: GetTaskCommentsParams
) {
  const query = new URLSearchParams();

  appendQueryParam(query, "cursor", params?.cursor);
  appendQueryParam(query, "limit", params?.limit);

  return apiFetch<GetTaskCommentsApiResponse>(
    `/api/tasks/${taskId}/comments?${query.toString()}`
  );
}

export async function createTaskComment(
  taskId: string,
  content: string
) {
  return apiFetch<CreateTaskCommentApiResponse>(
    `/api/tasks/${taskId}/comments`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    }
  );
}

export async function updateTaskComment(
  taskId: string,
  commentId: string,
  content: string
) {
  return apiFetch<UpdateTaskCommentApiResponse>(
    `/api/tasks/${taskId}/comments/${commentId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        content,
      }),
    }
  );
}

export async function deleteTaskComment(
  taskId: string,
  commentId: string
) {
  return apiFetch<DeleteTaskCommentApiResponse>(
    `/api/tasks/${taskId}/comments/${commentId}`,
    {
      method: "DELETE",
    }
  );
}