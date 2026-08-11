import { Member } from "@/types/project";
import { ApiTask, Task, TaskStatus } from "@/types/task";
import { toLocalInput } from "@/utils/date";

export function mapTaskFromApi(
  task: ApiTask
): Task {
  
  const assignee: Member | null =
    task.assignee
      ? {
          memberId: task.assignee.memberId,
          userId: "",
          name: task.assignee.name,
          role: task.assignee.role,
          isActive: task.assignee.isActive,
        }
      : null;

  return {
    id: task.taskId,
    title: task.title,
    description: task.description ?? "",

    project: {
        id: task.project.id,
        name: task.project.name
    },

    assignee,

    status: task.status as TaskStatus,

    priority: task.priority,

    startDate: task.startDate
      ? toLocalInput(task.startDate)
      : "", // to local date string

    dueDate: task.dueDate
      ? toLocalInput(task.dueDate)
      : "", // to local date string

    isActive: !task.completed,
    createdAt: task.createdAt, // still in ISO string
    updatedAt: task.updatedAt, // still in ISO string
    deletedAt: task.deletedAt  // still in ISO string
  };
}