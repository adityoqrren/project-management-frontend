import { Member, Role, User } from "./project"

export type Priority = "HIGH" | "MEDIUM" | "LOW"

export interface PriorityBadgeProps {
  priority: Priority
}

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE"

export interface TaskStatusBadgeProps {
  status: TaskStatus
}

export type ApiTask = {
  taskId: string;
  title: string;
  description: string;
  completed: boolean;
  status: string;

  priority: Priority;
  startDate: string;
  dueDate?: string;

  projectId?: string;

  project: {
    id: string;
    name: string;
  };

  assignee?: {
    memberId: string;
    name: string;
    role: Role;
    isActive: boolean;
    joinedAt: string;
  } | null;

  deletedAt: string | null;
}

export type Task = {
  id: string;
  title: string;
  description: string;
  project: {
    id: string;
    name: string;
  },
  assignee?: Member | null; // ✅ update
  status: TaskStatus;
  priority: Priority;
  startDate: string;
  dueDate?: string;
  isActive: boolean;
  deletedAt: string | null;
};

export type DashboardTask = {
  taskId: string;
  title: string;
  completed: boolean;
  project: {
    id: string;
    name: string;
  };
};

export interface MyTaskCounts {
  all: number;
  todo: number;
  inProgress: number;
  dueSoon: number;
  overdue: number;
  done: number;
}