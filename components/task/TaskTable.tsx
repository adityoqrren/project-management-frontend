import { Task } from "@/types/task"
import TaskRow from "./TaskRow"
import { ApiPagination } from "@/lib/task";
import Pagination from "../common/Pagination";
import TasksTableSkeleton from "./TasksTableSkeleton";


interface TasksTableProps {
  tasks: Task[];
  pagination: ApiPagination;

  loading: boolean;
  fetching: boolean;
  error: Error | null;

  hasActiveFilters: boolean;

  mode?: "active" | "archived" | "deleted";

  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onClearFilters: () => void;

  onOpenTask?: (task: Task) => void;
  onRestore?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onPermanentDelete?: (task: Task) => void;

  onRetry: () => void;
}

export default function TasksTable({
  tasks,
  pagination,
  loading,
  fetching,
  error,
  hasActiveFilters,
  onPageChange,
  onLimitChange,
  onClearFilters,
  onRetry,
  mode = "active",
  onOpenTask,
  onRestore,
  onDelete,
  onPermanentDelete,
}: TasksTableProps) {
  const emptyMessage = {
    active: "No tasks yet.",
    archived: "No archived tasks.",
    deleted: "No deleted tasks.",
  }[mode];

  if (loading) {
    return (
      <>
        <TasksTableSkeleton rows={pagination.limit} />

        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      </>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border p-4 text-center">
        <p className="text-gray-600">
          Failed to load tasks.
        </p>

        <button
          onClick={onRetry}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tasks.length === 0 && !fetching) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border p-4 text-center">
        <h3 className="text-lg font-semibold">
          {hasActiveFilters
            ? "No tasks match your filters."
            : emptyMessage}
        </h3>

        {hasActiveFilters && (
          <>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>

            <button
              onClick={onClearFilters}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-250">
          <thead className="sticky top-0 z-10 border-b bg-gray-50 text-gray-500 shadow-sm">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Project</th>
              <th className="p-4 text-left">Assignee</th>
              <th className="p-4 text-left">Start Date</th>
              <th className="p-4 text-left">Due Date</th>
              <th className="p-4 text-left">Priority</th>

              <th className="p-4 text-left">
                {mode === "active"
                  ? "Status"
                  : mode === "archived"
                    ? "Archived At"
                    : "Deleted At"}
              </th>

              {mode !== "active" && (
                <th className="w-16"></th>
              )}
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                mode={mode}
                onOpenTask={onOpenTask}
                onRestore={onRestore}
                onDelete={onDelete}
                onPermanentDelete={onPermanentDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        pagination={pagination}
        disabled={fetching}
      />
    </div>
  );
}
