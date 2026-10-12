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
import { getProjectTasks, getTaskById } from "@/lib/task";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEmptyPagination } from "@/components/common/Pagination";
import { isApiError } from "@/lib/errors";
import ErrorDialog from "@/components/ui/ErrorDialog";
import Link from "next/link";
import { ArrowRight, Filter, X } from "lucide-react";
import RefreshIndicator from "@/components/ui/RefreshIndicator";
import TaskFilters from "@/components/task/TaskFilters";

export default function TasksPage() {
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

  //const [loading, setLoading] = useState(true);

  // const [openDetailTaskDialog, setOpenDetailTaskDialog] = useState(false)
  const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false)
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

  const [sortBy, setSortBy] =
    useState(
      searchParams.get("sortBy") ?? ""
    );

  const [order, setOrder] =
    useState<"asc" | "desc">(
      (searchParams.get("order") as "asc" | "desc") ?? "asc"
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

  const activeFilterCount = [
    assignee,
    taskStatus,
    priority,
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(
    search ||
    assignee ||
    taskStatus ||
    priority
  );

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

  // Fetch tasks from API
  const {
    data: tasksData,
    isLoading: tasksLoading,
    isFetching: tasksFetching,
    error: tasksError,
  } = useQuery({
    queryKey: [
      "projectTasks",
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
      getProjectTasks(
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
  const currentMember = members.find(
    (member) => member.userId === user?.id
  );


  // console.log(`userId : ${user?.id} || memberUserId : ${currentMember?.userId}`)

  const canManageTask =
    currentMember?.role === "LEADER";


  const loading = tasksLoading || membersLoading;

  const error = tasksError || membersError;

  const handleOpenTask = (task: Task) => {
    const query = searchParams.toString();

    router.push(
      query
        ? `/projects/${projectId}/tasks/${task.id}?${query}`
        : `/projects/${projectId}/tasks/${task.id}`
    );
  }

  //Filter Handlers
  const handleAssigneeChange = (value: string) => {
    setAssignee(value);
    setPage(1);
  };

  const handleTaskStatusChange = (value: string) => {
    setTaskStatus(value);
    setPage(1);
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleOrderChange = (value: "asc" | "desc") => {
    setOrder(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setAssignee("");
    setTaskStatus("");
    setPriority("");
    setSearch("");
    setSearchInput("");
  }

  return (
    <div className="flex h-full flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Tasks
          </h1>
          {canManageTask && (
            <Link
              href={`/projects/${projectId}/tasks/deleted`}
              className="
      mt-2
      inline-flex
      items-center
      gap-1
      text-sm
      text-red-600
      hover:text-red-700
      hover:underline
                "
            >
              View deleted tasks
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
        {canManageTask && (
          <button onClick={() => setOpenAddTaskDialog(true)} className="px-4 py-2 bg-black text-white rounded-md">
            Add Task
          </button>
        )
        }
      </div>

      {/* Desktop filters */}
      <div className="hidden shrink-0 lg:block">
        <TaskFilters
          assignee={assignee}
          taskStatus={taskStatus}
          priority={priority}
          searchInput={searchInput}
          sortBy={sortBy}
          order={order}
          members={members}
          hasActiveFilters={hasActiveFilters}
          onAssigneeChange={handleAssigneeChange}
          onTaskStatusChange={handleTaskStatusChange}
          onPriorityChange={handlePriorityChange}
          onSearchChange={handleSearchChange}
          onSortByChange={handleSortByChange}
          onOrderChange={handleOrderChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Mobile filter + table area */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 lg:hidden">
          <button
            type="button"
            onClick={() => setFilterOpen((open) => !open)}
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-md
              border
              bg-white
              px-3
              py-2
              text-sm
              text-gray-700
              hover:bg-gray-50
            "
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
                    {" "}
                    | Filters ({activeFilterCount})
                  </span>
                )}
              </span>
            </span>

            {filterOpen ? (
              <X className="size-4 shrink-0" />
            ) : (
              <span className="text-gray-400">
                {activeFilterCount > 0
                  ? `(${activeFilterCount})`
                  : ""}
              </span>
            )}
          </button>
        </div>

        {/* Mobile overlay */}
        {filterOpen && (
          <div
            className="
          absolute
          inset-x-0
          top-0
          z-30
          max-h-[calc(100dvh-8rem)]
          overflow-y-auto
          rounded-md
          border
          bg-white
          p-4
          shadow-lg
          lg:hidden
        "
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-900">
                Filter & Sorting
              </h2>

              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="
              rounded-md
              p-1
              text-gray-400
              hover:bg-gray-100
              hover:text-gray-700
            "
                aria-label="Close filter"
              >
                <X className="size-4" />
              </button>
            </div>

            <TaskFilters
              assignee={assignee}
              taskStatus={taskStatus}
              priority={priority}
              searchInput={searchInput}
              sortBy={sortBy}
              order={order}
              members={members}
              hasActiveFilters={hasActiveFilters}
              onAssigneeChange={handleAssigneeChange}
              onTaskStatusChange={handleTaskStatusChange}
              onPriorityChange={handlePriorityChange}
              onSearchChange={handleSearchChange}
              onSortByChange={handleSortByChange}
              onOrderChange={handleOrderChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

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
            onOpenTask={handleOpenTask}
            onRetry={() => queryClient.invalidateQueries({
              queryKey: ["projectTasks", projectId],
            })}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters} />
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
      {/* )} */}

      <AddTaskDialog
        isOpen={openAddTaskDialog}
        onClose={() => setOpenAddTaskDialog(false)}
        projectId={projectId}
        projectName={project.name}
      />

    </div>
  )
}