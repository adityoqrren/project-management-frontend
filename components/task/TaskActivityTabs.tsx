"use client";

import { useState } from "react";

import CommentsSection from "./CommentsSection";
import TaskActivityHistory from "./TaskActivityHistory";

interface TaskActivityTabsProps {
  taskId: string;
  canManageTask: boolean;
}

type ActivityTab = "comments" | "history";

export default function TaskActivityTabs({
  taskId,
  canManageTask,
}: TaskActivityTabsProps) {
  const [activeTab, setActiveTab] =
    useState<ActivityTab>("comments");

  return (
    <section>
      <div className="border-b">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`relative px-1 pb-3 text-sm font-medium ${
              activeTab === "comments"
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Comments

            {activeTab === "comments" && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-gray-900" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`relative ml-6 px-1 pb-3 text-sm font-medium ${
              activeTab === "history"
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            History

            {activeTab === "history" && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-gray-900" />
            )}
          </button>
        </div>
      </div>

      <div className="pt-6">
        {activeTab === "comments" && (
          <CommentsSection
            taskId={taskId}
            canManageTask={canManageTask}
          />
        )}

        {activeTab === "history" && (
          <TaskActivityHistory taskId={taskId} />
        )}
      </div>
    </section>
  );
}