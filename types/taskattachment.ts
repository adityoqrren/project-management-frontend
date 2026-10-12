export type TaskAttachmentType =
  | "all"
  | "image"
  | "file";

export interface TaskAttachmentUser {
  id: string;
  username: string;
  name: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  userId: string;
  originalFileName: string;
  fileName : string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
  user: TaskAttachmentUser;
}

export interface UploadedTaskAttachment {
  id: string;
  taskId: string;
  userId: string;
  projectId: string;
  taskTitle: string;
  originalFileName: string;
  fileName: string;
  mimeType: string;
  size: number;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetTaskAttachmentsApiResponse {
  status: string;
  message: string;
  data: TaskAttachment[];
}

export interface UploadTaskAttachmentApiResponse {
  status: string;
  message: string;
  data: UploadedTaskAttachment;
}

export interface DeleteTaskAttachmentApiResponse {
  status: string;
  message: string;
}