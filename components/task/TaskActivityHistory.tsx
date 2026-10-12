"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getTaskActivityLogs, TaskActivityLog } from "@/lib/activityLogApi";
import { formatDateTimeLocal, formatDateTimeStringLocal } from "@/utils/formatter";

interface TaskActivityHistoryProps {
  taskId: string;
}

const ACTIVITY_LIMIT = 20;

function getActivityDescription(
  activity: TaskActivityLog
) {
  switch (activity.type) {
    case "task.created":
      return (
        <>
          <span className="font-medium text-gray-700">
            {activity.actorName}
          </span>{" "}
          created task{" "}
          <span className="font-medium text-gray-700">
            {activity.taskTitle}
          </span>
        </>
      );

    case "task.updated":
      return (
        <>
          <span className="font-medium text-gray-700">
            {activity.actorName}
          </span>{" "}
          updated task{" "}
          <span className="font-medium text-gray-700">
            {activity.taskTitle}
          </span>
        </>
      );

    case "task.assigned":
      return (
        <>
          <span className="font-medium text-gray-700">
            {activity.actorName}
          </span>{" "}
          assigned task{" "}
          <span className="font-medium text-gray-700">
            {activity.taskTitle}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-700">
            {activity.targetUserName}
          </span>
        </>
      );

    case "task.completed":
      return (
        <>
          <span className="font-medium text-gray-700">
            {activity.actorName}
          </span>{" "}
          completed task{" "}
          <span className="font-medium text-gray-700">
            {activity.taskTitle}
          </span>
        </>
      );

    case "task.deleted":
      return (
        <>
          <span className="font-medium text-gray-700">
            {activity.actorName}
          </span>{" "}
          deleted task{" "}
          <span className="font-medium text-gray-700">
            {activity.taskTitle}
          </span>
        </>
      );

    case "task.attachment.added":
      return (
        <>
          <span className="font-medium text-gray-700">
            {activity.actorName}
          </span>{" "}
          added an attachment to task{" "}
          <span className="font-medium text-gray-700">
            {activity.taskTitle}
          </span>
        </>
      );

    case "task.attachment.deleted":
      return (
        <>
          <span className="font-medium text-gray-700">
            {activity.actorName}
          </span>{" "}
          deleted an attachment from task{" "}
          <span className="font-medium text-gray-700">
            {activity.taskTitle}
          </span>
        </>
      );

    case "task.comment.created":
      return (
        <>
          <span className="font-medium text-gray-700">
            {activity.actorName}
          </span>{" "}
          added a comment to task{" "}
          <span className="font-medium text-gray-700">
            {activity.taskTitle}
          </span>
        </>
      );

    case "task.comment.updated":
      return (
        <>
          <span className="font-medium text-gray-700">
            {activity.actorName}
          </span>{" "}
          updated a comment on task{" "}
          <span className="font-medium text-gray-700">
            {activity.taskTitle}
          </span>
        </>
      );

    case "task.comment.deleted":
      return (
        <>
          <span className="font-medium text-gray-700">
            {activity.actorName}
          </span>{" "}
          deleted a comment from task{" "}
          <span className="font-medium text-gray-700">
            {activity.taskTitle}
          </span>
        </>
      );

    default:
      return null;
  }
}

export default function TaskActivityHistory({
  taskId,
}: TaskActivityHistoryProps) {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["taskActivityLogs", taskId],

    queryFn: ({
      pageParam,
    }: {
      pageParam: string | undefined;
    }) =>
      getTaskActivityLogs(taskId, {
        cursor: pageParam,
        limit: ACTIVITY_LIMIT,
      }),

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.nextCursor ?? undefined,

    enabled: !!taskId,
  });

  const activities =
    data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <section>
      <h2 className="text-sm font-medium text-gray-500">
        Activity History
      </h2>

      <div className="mt-3 max-h-80 overflow-y-auto border-t">
        {isLoading && (
          <div className="space-y-4 py-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="h-4 w-3/4 rounded bg-gray-100" />
                <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="py-6 text-sm text-red-500">
            Failed to load activity history.
          </div>
        )}

        {!isLoading &&
          !isError &&
          activities.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                No activity yet.
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          activities.length > 0 && (
            <div className="divide-y">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="py-4 first:pt-5"
                >
                  <p className="text-sm leading-5 text-gray-600">
                    {getActivityDescription(activity)}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {formatDateTimeStringLocal(
                      activity.createdAt
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

        {hasNextPage && (
          <div className="border-t py-3">
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetchingNextPage
                ? "Loading..."
                : "Load more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}