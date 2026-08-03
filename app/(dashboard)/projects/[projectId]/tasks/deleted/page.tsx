"use client"

import TasksTable from "@/components/task/TaskTable";
import { Task, TaskStatus } from "@/types/task";
import { useEffect, useMemo, useState } from "react"
import TaskDetailDialog from "@/components/task/TaskDetailDialog"
import AddTaskDialog from "@/components/task/AddTaskDialog";
import {
  useParams,
  useSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";
import { getProjectMembers } from "@/lib/project";
import { Member } from "@/types/project";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { getDeletedProjectTasks, getProjectTasks, getTaskById, permanentlyDeleteTask, restoreTask } from "@/lib/task";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEmptyPagination } from "@/components/common/Pagination";
import { isApiError } from "@/lib/errors";
import ErrorDialog from "@/components/ui/ErrorDialog";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RefreshIndicator from "@/components/ui/RefreshIndicator";

export default function DeletedTasksPage() {
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();

  const router = useRouter();

  const pathname = usePathname();

  const searchParams =
    useSearchParams();

  const queryClient = useQueryClient();

  const {
    project,
  } = useProject();

  const [assignee, setAssignee] =
    useState(
      searchParams.get("assignee") ?? ""
    );

  const [taskStatus, setTaskStatus] =
    useState(
      searchParams.get("taskStatus") ?? ""
    );

  const [priority, setPriority] =
    useState(
      searchParams.get("priority") ?? ""
    );

  const [sortBy, setSortBy] =
    useState(
      searchParams.get("sortBy") ?? "deletedAt"
    );

  const [order, setOrder] =
    useState<"asc" | "desc">(
      (searchParams.get("order") as "asc" | "desc") ?? "desc"
    );

  const [searchInput, setSearchInput] =
    useState(
      searchParams.get("search") ?? ""
    );

  const [search, setSearch] =
    useState(
      searchParams.get("search") ?? ""
    );

  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [limit, setLimit] = useState(
    Number(searchParams.get("limit")) || 5
  );

  const hasActiveFilters = Boolean(
    search ||
    assignee ||
    taskStatus ||
    priority
  );

  const [restoreTarget, setRestoreTarget] =
    useState<Task | null>(null);

  const [permanentDeleteTarget, setPermanentDeleteTarget] =
    useState<Task | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    if (assignee) {
      params.set("assignee", assignee);
    } else {
      params.delete("assignee");
    }

    if (taskStatus) {
      params.set("taskStatus", taskStatus);
    } else {
      params.delete("taskStatus");
    }

    if (priority) {
      params.set("priority", priority);
    } else {
      params.delete("priority");
    }

    if (sortBy) {
      params.set("sortBy", sortBy);
    } else {
      params.delete("sortBy");
    }

    if (order !== "asc") {
      params.set("order", order);
    } else {
      params.delete("order");
    }

    if (page)
      params.set(
        "page",
        String(page)
      )
    else
      params.delete("page");

    if (limit)
      params.set(
        "limit",
        String(limit)
      )
    else
      params.delete("limit");

    const newQuery = params.toString();

    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
      router.replace(
        `${pathname}?${newQuery}`,
        {
          scroll: false,
        }
      );
    }
  }, [
    search,
    assignee,
    taskStatus,
    priority,
    sortBy,
    order,
    page,
    limit,
    pathname,
    router,
    searchParams
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  console.log("Deleted Tasks mounted");

  // Fetch tasks from API
  const {
    data: tasksData,
    isLoading: tasksLoading,
    isFetching: tasksFetching,
    error: tasksError,
  } = useQuery({
    queryKey: [
      "deletedProjectTasks",
      projectId,
      page,
      limit,
      search,
      assignee,
      taskStatus,
      priority,
      sortBy,
      order,
    ],
    queryFn: () =>
      getDeletedProjectTasks(
        projectId,
        {
          search:
            search || undefined,

          assignee:
            assignee || undefined,

          taskStatus:
            taskStatus || undefined,

          priority:
            priority || undefined,

          sortBy:
            sortBy || undefined,

          page:
            page || undefined,

          limit:
            limit || undefined,

          order,
        }
      ),
    placeholderData: keepPreviousData,
  });

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getProjectMembers(projectId),
  })

  const members: Member[] = useMemo(() => {
    return (
      membersData?.data.map((m) => ({
        memberId: m.memberId,
        userId: m.userId,
        name: m.name,
        role: m.role === "LEADER" ? "LEADER" : "MEMBER",
        isActive: m.isActive,
      })) ?? []
    );
  }, [membersData]);


  const tasks = tasksData?.data ?? [];
  const pagination =
    tasksData?.pagination
      ? {
        ...tasksData.pagination,
        page,
        limit,
      }
      : createEmptyPagination(limit);
  // Find current logged in member id
  // const currentMember = members.find(
  //   (member) => member.userId === user?.id
  // );


  // console.log(`userId : ${user?.id} || memberUserId : ${currentMember?.userId}`)

  // const canManageTask =
  //   currentMember?.role === "LEADER";

  const loading = tasksLoading || membersLoading;

  const error = tasksError || membersError;


  const handleClearFilters = () => {
    setAssignee("");
    setTaskStatus("");
    setPriority("");
    setSearch("");
    setSearchInput("");
  }

  const restoreTaskMutation =
    useMutation({

      mutationFn: (taskId: string) => restoreTask(taskId),
      onSuccess: async () => {

        await queryClient.invalidateQueries({
          queryKey: [
            "deletedProjectTasks",
            projectId,
          ],
        });

        await queryClient.invalidateQueries({
          queryKey: [
            "projectTasks",
            projectId,
          ],
        });

        setRestoreTarget(null);

      },

    });

  const permanentDeleteTaskMutation =
    useMutation({

      mutationFn: (taskId: string) =>
        permanentlyDeleteTask(taskId),

      onSuccess: async () => {

        await queryClient.invalidateQueries({
          queryKey: [
            "deletedProjectTasks",
            projectId,
          ],
        });

        setPermanentDeleteTarget(null);

      },

    });

  const handleRestore =
    (task: Task) => {

      setRestoreTarget(task);

    };

  const handlePermanentDelete =
    (task: Task) => {

      setPermanentDeleteTarget(task);

    };

  return (
    <div className="flex h-full flex-col gap-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-semibold">
            Deleted Tasks
          </h1>

          <Link
            href={`/projects/${projectId}/tasks`}
            className="
                mt-2
                inline-flex
                items-center
                gap-1
                text-sm
                text-gray-600
                hover:text-black
            "
          >
            <ArrowLeft className="size-4" /> View active projects
          </Link>

        </div>

      </div>

      {/* Filter & Sorting */}
      <div className="space-y-3">

        <div
          className="
          flex-1
        flex flex-col
        lg:justify-start
        gap-3
      "
        >

          {/*FILTERS */}
          <div
            className="
          flex flex-col
          sm:flex-row
          sm:flex-wrap
          gap-3
        "
          >

            {/* Assignee */}
            <select
              value={assignee}
              onChange={(e) => {
                setAssignee(e.target.value)
                setPage(1);
              }
              }
              className="
            border rounded-md px-3 py-2
            bg-white text-sm
            min-w-[220px]
          "
            >
              <option value="">
                All Assignees
              </option>

              <option value="unassigned">
                Unassigned
              </option>

              {members.map((member) => (
                <option
                  key={member.memberId}
                  value={member.memberId}
                >
                  {member.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={taskStatus}
              onChange={(e) => {
                setTaskStatus(e.target.value);
                setPage(1);
              }
              }
              className="
            border rounded-md px-3 py-2
            bg-white text-sm
            min-w-[180px]
          "
            >
              <option value="">
                All Statuses
              </option>

              <option value="TODO">
                Todo
              </option>

              <option value="IN_PROGRESS">
                In Progress
              </option>

              <option value="DONE">
                Done
              </option>
            </select>

            {/* Priority */}
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }
              }
              className="
            border rounded-md px-3 py-2
            bg-white text-sm
            min-w-[180px]
          "
            >
              <option value="">
                All Priorities
              </option>

              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="
      px-3 py-2
      rounded-md
      border
      text-sm
      text-gray-600
      hover:bg-red-50
      hover:text-red-600
      hover:border-red-200
      transition
    "
              >
                Clear Filters
              </button>
            )}

          </div>

          {/* SORTING */}
          <div
            className="
          flex flex-col
          lg:flex-row
          gap-3
        "
          >

            {/* SEARCH BAR */}
            <div className="relative lg:min-w-[320px]">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }
                }
                placeholder="Search task title..."
                className="
      w-full
      border rounded-md
      px-3 py-2
      pr-10
      bg-white text-sm
    "
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="
        absolute
        right-3
        top-1/2
        -translate-y-1/2
        text-gray-400
        hover:text-gray-700
      "
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1);
              }
              }
              className="
            border rounded-md px-3 py-2
            bg-white text-sm
            min-w-[180px]
          "
            >
              <option value="">
                Sort By
              </option>

              <option value="title">
                Title
              </option>

              <option value="status">
                Status
              </option>

              <option value="assignee_name">
                Assignee
              </option>

              <option value="priority">
                Priority
              </option>

              <option value="startDate">
                Start Date
              </option>

              <option value="dueDate">
                Due Date
              </option>
            </select>

            <select
              value={order}
              onChange={(e) => {
                setOrder(
                  e.target.value as "asc" | "desc"
                )
                setPage(1);
              }
              }
              className="
            border rounded-md px-3 py-2
            bg-white text-sm
            min-w-[140px]
          "
            >
              <option value="asc">
                Ascending
              </option>

              <option value="desc">
                Descending
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* {!loading && tasks.length === 0 && !hasActiveFilters ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border text-gray-400">
          No tasks yet. Create your first task.
        </div>
      ) : (!loading && tasks.length === 0 && hasActiveFilters) ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border text-gray-400">
          No tasks match your filters.
        </div>
      ) : */}
      {/* ( */}
      <div className="flex items-center justify-center mb-3">

        {tasksFetching && (
          <RefreshIndicator loading={tasksFetching} />
        )}

      </div>
      <div className="flex-1 min-h-0">
        <TasksTable
          tasks={tasks}
          pagination={pagination}
          loading={loading}
          fetching={tasksFetching}
          error={error as Error | null}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onRetry={() => queryClient.invalidateQueries({
            queryKey: ["projectTasks", projectId],
          })}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          mode="deleted"
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
        />
      </div>
      {/* )} */}

      {/** Confirm Dilaog for restore task */}
      <ConfirmDialog
        open={!!restoreTarget}
        title="Restore Task"
        description={
          restoreTarget
            ? `Are you sure you want to restore "${restoreTarget.title}"?`
            : ""
        }
        confirmLabel="Restore"
        loading={
          restoreTaskMutation.isPending
        }
        onConfirm={() => {

          if (!restoreTarget) {
            return;
          }

          restoreTaskMutation.mutate(
            restoreTarget.id
          );

        }}
        onCancel={() =>
          setRestoreTarget(null)
        }
      />

      {/** Confirm Dilaog for delete task permanently */}
      <ConfirmDialog
        open={!!permanentDeleteTarget}
        title="Delete Task Permanently"
        description={
          permanentDeleteTarget
            ? `Are you sure you want to permanently delete "${permanentDeleteTarget.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={
          permanentDeleteTaskMutation.isPending
        }
        onConfirm={() => {

          if (
            !permanentDeleteTarget
          ) {
            return;
          }

          permanentDeleteTaskMutation.mutate(
            permanentDeleteTarget.id
          );

        }}
        onCancel={() =>
          setPermanentDeleteTarget(null)
        }
      />

    </div>
  )
}