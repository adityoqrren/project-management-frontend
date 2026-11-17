"use client"

import TasksTable from "@/components/task/TaskTable";
import { Task, TaskStatus } from "@/types/task";
import { useEffect, useMemo, useState } from "react"
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
import { deleteTask, getArchivedProjectTasks, getDeletedProjectTasks, getProjectTasks, getTaskById, permanentlyDeleteTask, restoreTask, unarchiveTask } from "@/lib/task";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEmptyPagination } from "@/components/common/Pagination";
import { isApiError } from "@/lib/errors";
import ErrorDialog from "@/components/ui/ErrorDialog";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Filter, Loader2, X } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RefreshIndicator from "@/components/ui/RefreshIndicator";
import { ToastType, useToast } from "@/context/ToastContext";

export default function ArchivedAndDeletedTasksPage() {
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

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TaskView>(
    searchParams.get("tab") === "deleted"
      ? "deleted"
      : "archived"
  );

  const [filterOpen, setFilterOpen] = useState(false);

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

  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") ??
    (activeTab === "archived" ? "archivedAt" : "deletedAt")
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

  type TaskView = "archived" | "deleted";

  const hasActiveFilters = Boolean(
    search ||
    assignee ||
    taskStatus ||
    priority
  );

  const activeFilterCount = [
    assignee,
    taskStatus,
    priority,
  ].filter(Boolean).length;

  const taskParams = {
    search: search || undefined,
    assignee: assignee || undefined,
    taskStatus: taskStatus || undefined,
    priority: priority || undefined,
    sortBy: sortBy || undefined,
    page,
    limit,
    order,
  };

  const [softDeleteTarget, setSoftDeleteTarget] =
    useState<Task | null>(null);

  const [restoreTarget, setRestoreTarget] = useState<{
    task: Task;
    mode: TaskView;
  } | null>(null);

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

    if (activeTab) {
      params.set("tab", activeTab);
    }

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
    searchParams,
    activeTab
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
      activeTab === "archived"
        ? "archivedProjectTasks"
        : "deletedProjectTasks",
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
      activeTab === "archived"
        ? getArchivedProjectTasks(projectId, taskParams)
        : getDeletedProjectTasks(projectId, taskParams),
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

  const invalidateTaskLists = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["archivedProjectTasks", projectId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["deletedProjectTasks", projectId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["projectTasks", projectId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["myTasks"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["projectStatistics", projectId]
      })
    ]);
  };

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
    setPage(1);
  }

  const restoreMutation = useMutation({
    mutationFn: ({
      taskId,
      mode,
    }: {
      taskId: string;
      mode: TaskView;
      archiveSource: Task["archiveSource"];
    }) =>
      mode === "archived"
        ? unarchiveTask(taskId)
        : restoreTask(taskId),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      })
      await invalidateTaskLists();

      const destination =
        variables.mode === "archived"
          ? "active"
          : variables.archiveSource === "MANUAL"
            ? "archived"
            : "active";

      setRestoreTarget(null);

      showToast(
        `Task successfully restored to ${destination === "active" ? "Active" : "Archived"} tasks list`
      );
    },

    onError: (error) => {
      console.error(error);
      showToast("Failed to restore task", ToastType.error);
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),

    onSuccess: async () => {
      await invalidateTaskLists();

      setSoftDeleteTarget(null);
      showToast("Task deleted successfully");
    },

    onError: (error) => {
      console.error(error);
      showToast("Failed to delete task", ToastType.error);
    },
  });

  const permanentDeleteTaskMutation = useMutation({
    mutationFn: (taskId: string) =>
      permanentlyDeleteTask(taskId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["deletedProjectTasks", projectId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myTasks"],
        }),
      ]);

      setPermanentDeleteTarget(null);
      showToast("Task permanently deleted");
    },

    onError: (error) => {
      console.error(error);
      showToast(
        "Failed to permanently delete task",
        ToastType.error
      );
    },
  });

  const handleTabChange = (tab: TaskView) => {
    if (tab === activeTab) return;

    setActiveTab(tab);
    setPage(1);
    setSortBy(tab === "archived" ? "archivedAt" : "deletedAt");
    setFilterOpen(false);
  };

  const handleOpenTask = (task: Task) => {
    const query = searchParams.toString();

    router.push(
      query
        ? `/projects/${projectId}/tasks/${task.id}?${query}`
        : `/projects/${projectId}/tasks/${task.id}`
    );
  }

  const handleRestore = (task: Task) => {
    setRestoreTarget({
      task,
      mode: activeTab,
    });
  };

  const handleDelete = (task: Task) => {
    setSoftDeleteTarget(task);
  };

  const handlePermanentDelete = (task: Task) => {
    setPermanentDeleteTarget(task);
  };

  return (
    <div className="flex h-full flex-col gap-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-semibold">
            Archived & Deleted Tasks
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
            <ArrowLeft className="size-4" /> View active tasks
          </Link>

        </div>

      </div>

      {/** Tabs */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => handleTabChange("archived")}
          className={`px-4 py-2 ${activeTab === "archived"
            ? "border-b-2 border-primary font-semibold"
            : "text-muted-foreground"
            }`}
        >
          Archived
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("deleted")}
          className={`px-4 py-2 ${activeTab === "deleted"
            ? "border-b-2 border-primary font-semibold"
            : "text-muted-foreground"
            }`}
        >
          Deleted
        </button>
      </div>


      {/* Mobile filter toggle + Filter, Sorting, and Tasks Table */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* Mobile filter toggle */}
        <div className="shrink-0 lg:hidden">
          <button
            type="button"
            onClick={() => setFilterOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Filter className="size-4 shrink-0" />

              <span className="truncate">
                {search
                  ? `Search for '${search}'`
                  : activeFilterCount > 0
                    ? `Filters (${activeFilterCount})`
                    : "Filter"}

                {search && activeFilterCount > 0 && (
                  <span className="text-gray-500">
                    {" "} | Filters ({activeFilterCount})
                  </span>
                )}
              </span>
            </span>

            {filterOpen ? (
              <X className="size-4 shrink-0" />
            ) : (
              <span className="text-gray-400">
                {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </span>
            )}
          </button>
        </div>

        {/* Filter and sorting panel */}
        <div
          className={`
      ${filterOpen ? "block" : "hidden"}
      absolute inset-x-0 top-0 z-30
      max-h-[calc(100dvh-8rem)]
      overflow-y-auto
      rounded-md border bg-white p-4 shadow-lg
      lg:static lg:block lg:max-h-none
      lg:overflow-visible lg:rounded-none
      lg:border-0 lg:bg-transparent
      lg:p-0 lg:shadow-none
    `}
        >
          {/* Mobile panel header */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <h2 className="text-sm font-medium text-gray-900">
              Filter & Sorting
            </h2>

            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              aria-label="Close filter"
              className="text-gray-500 hover:text-gray-900"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* Assignee */}
              <select
                value={assignee}
                onChange={(e) => {
                  setAssignee(e.target.value);
                  setPage(1);
                }}
                className="min-w-[220px] rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="">All Assignees</option>
                <option value="unassigned">Unassigned</option>

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
                }}
                className="min-w-[180px] rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>

              {/* Priority */}
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
                className="min-w-[180px] rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-md border px-3 py-2 text-sm text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Sorting */}
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Search */}
              <div className="relative lg:min-w-[320px]">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search task title..."
                  className="w-full rounded-md border bg-white px-3 py-2 pr-10 text-sm"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                    }}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="min-w-[180px] rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="">Sort By</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
                <option value="assignee_name">Assignee</option>
                <option value="priority">Priority</option>
                <option value="startDate">Start Date</option>
                <option value="dueDate">Due Date</option>

                {activeTab === "archived" ? (
                  <option value="archivedAt">Archived Date</option>
                ) : (
                  <option value="deletedAt">Deleted Date</option>
                )}
              </select>

              {/* Sort order */}
              <select
                value={order}
                onChange={(e) => {
                  setOrder(e.target.value as "asc" | "desc");
                  setPage(1);
                }}
                className="min-w-[140px] rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Refresh indicator */}
        <div className="mb-3 flex items-center justify-center">
          {tasksFetching && (
            <RefreshIndicator loading={tasksFetching} />
          )}
        </div>

        {/* Tasks table */}
        <div className="min-h-0 flex-1">
          <TasksTable
            tasks={tasks}
            pagination={pagination}
            loading={loading}
            fetching={tasksFetching}
            error={error as Error | null}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onOpenTask={handleOpenTask}
            onRetry={() =>
              queryClient.invalidateQueries({
                queryKey: [
                  activeTab === "archived"
                    ? "archivedProjectTasks"
                    : "deletedProjectTasks",
                  projectId,
                ],
              })
            }
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            mode={activeTab}
            onRestore={handleRestore}
            onDelete={handleDelete}
            onPermanentDelete={handlePermanentDelete}
          />
        </div>
      </div>
      {/* )} */}

      {/** Confirm Dilaog for restore task */}
      <ConfirmDialog
        open={!!restoreTarget}
        title="Restore Task"
        description={
          restoreTarget
            ? `Are you sure you want to restore "${restoreTarget.task.title}" to the ${restoreTarget.mode === "archived"
              ? "Active"
              : restoreTarget.task.archiveSource === "MANUAL"
                ? "Archived"
                : "Active"
            } tasks list?`
            : ""
        }
        confirmLabel="Restore"
        loading={restoreMutation.isPending}
        onCancel={() => setRestoreTarget(null)}
        onConfirm={() => {
          if (!restoreTarget) return;

          restoreMutation.mutate({
            taskId: restoreTarget.task.id,
            mode: restoreTarget.mode,
            archiveSource: restoreTarget.task.archiveSource,
          });
        }}
      />

      {/** Confirm Dialog for soft delete Archived Task */}
      <ConfirmDialog
        open={!!softDeleteTarget}
        title="Delete Task"
        description={`Are you sure you want to delete "${softDeleteTarget?.title}"?`}
        confirmLabel="Delete"
        loading={softDeleteMutation.isPending}
        onCancel={() => setSoftDeleteTarget(null)}
        onConfirm={() => {
          if (!softDeleteTarget) return;

          softDeleteMutation.mutate(softDeleteTarget.id);
        }}
      />

      {/** Confirm Dilaog for delete task permanently */}
      <ConfirmDialog
        open={!!permanentDeleteTarget}
        title="Delete Task Permanently"
        description={`Are you sure you want to permanently delete "${permanentDeleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        loading={permanentDeleteTaskMutation.isPending}
        onCancel={() => setPermanentDeleteTarget(null)}
        onConfirm={() => {
          if (!permanentDeleteTarget) return;

          permanentDeleteTaskMutation.mutate(
            permanentDeleteTarget.id
          );
        }}
      />

    </div>
  )
}