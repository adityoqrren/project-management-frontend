import { ApiNotification, Notification, NotificationPagination } from "@/types/notifications";
import { apiFetch } from "./api";
import { ApiPagination } from "./task";

export interface NotificationListResponse {
  status: string;
  data: ApiNotification[];
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  status: string;
  data: {
    count: number;
  };
}

export interface MarkAllReadResponse {
  status: string;
  message: string;
  data: {
    updatedCount: number;
  };
}

interface GetNotificationsParams {
  limit?: number;
  cursor?: string;
}

export async function getNotifications({
  limit = 20,
  cursor,
}: GetNotificationsParams = {}) {
  const params = new URLSearchParams();

  params.set("limit", String(limit));

  if (cursor) {
    params.set("cursor", cursor);
  }

  const res = await apiFetch<NotificationListResponse>(
    `/api/notifications?${params.toString()}`
  );

  return {
    ...res,
    data: res.data as Notification[],
  };
}
export async function getUnreadNotificationCount() {
  return apiFetch<UnreadCountResponse>(
    "/api/notifications/unread-count"
  );
}

export async function markNotificationAsRead(
  notificationId: string
) {
  return apiFetch(
    `/api/notifications/${notificationId}/read`,
    {
      method: "PATCH",
    }
  );
}

export async function markAllNotificationsAsRead() {
  return apiFetch<MarkAllReadResponse>(
    "/api/notifications/read-all",
    {
      method: "PATCH",
    }
  );
}

// for routing between pages
export function getNotificationHref(
  notification: Notification
) {
  switch (notification.entityType) {
    case "task":
      return `/projects/${notification.projectId}/tasks?taskId=${notification.entityId}`;

    case "project":
      return `/projects/${notification.projectId}`;

    default:
      return null;
  }
}