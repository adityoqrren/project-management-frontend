"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProjectTasks } from "@/lib/task";
import { Task } from "@/types/task";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight} from "lucide-react";
import Link from "next/link";

const taskStatusLabel = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done"
}

interface TaskListPreviewProps {
  projectId: string;
  tasks: Task[];
  loading: boolean;
}

export default function TaskListPreview({ projectId, tasks, loading }: TaskListPreviewProps) {

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Recent Tasks
        </h2>

        <Link
          href={`/projects/${projectId}/tasks`}
          className="
      flex items-center gap-1
      text-sm
      text-blue-600
      hover:text-blue-700
      transition
    "
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-sm text-gray-400">
          No tasks yet
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between border-b pb-2"
            >
              <span>{task.title}</span>
              <span className="text-sm text-gray-500">
                {taskStatusLabel[task.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}