export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityType: string;
  entityId: string;
  projectId: string;
}

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityType: string;
  entityId: string;
  projectId: string;
}

export interface NotificationPagination {
  limit: number;
  nextCursor: string | null;
}