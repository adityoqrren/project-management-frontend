import { apiFetch } from "@/lib/api";
import {
  TaskAttachmentType,
  GetTaskAttachmentsApiResponse,
  UploadTaskAttachmentApiResponse,
  DeleteTaskAttachmentApiResponse,
} from "@/types/taskattachment";

export async function getTaskAttachments(
  taskId: string,
  type: TaskAttachmentType = "all"
) {
  const searchParams = new URLSearchParams();

  searchParams.set("type", type);

  return apiFetch<GetTaskAttachmentsApiResponse>(
    `/api/tasks/${taskId}/attachments?${searchParams.toString()}`
  );
}

export async function uploadTaskImage(
  taskId: string,
  fileName: string,
  file: File
) {
  const formData = new FormData();

  formData.append("fileName", fileName);
  formData.append("file", file);

  // simulate loading
  await new Promise((resolve) =>
    setTimeout(resolve, 3000)
  );

  return apiFetch<UploadTaskAttachmentApiResponse>(
    `/api/tasks/${taskId}/attachments/images`,
    {
      method: "POST",
      body: formData,
    }
  );
}

export async function uploadTaskFile(
  taskId: string,
  fileName: string,
  file: File
) {
  const formData = new FormData();

  formData.append("fileName", fileName);
  formData.append("file", file);

  return apiFetch<UploadTaskAttachmentApiResponse>(
    `/api/tasks/${taskId}/attachments/files`,
    {
      method: "POST",
      body: formData,
    }
  );
}

export async function deleteTaskAttachment(
  taskId: string,
  attachmentId: string
) {
  return apiFetch<DeleteTaskAttachmentApiResponse>(
    `/api/tasks/${taskId}/attachments/${attachmentId}`,
    {
      method: "DELETE",
    }
  );
}