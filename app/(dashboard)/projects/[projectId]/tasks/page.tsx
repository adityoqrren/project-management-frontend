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
import { ArrowRight } from "lucide-react";
import RefreshIndicator from "@/components/ui/RefreshIndicator";

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

  // getting task id from parameter
  const taskId =
    searchParams.get("taskId");

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

  const {
    data: taskDetail,
    isLoading: taskDetailLoading,
    isError: taskDetailError,
  } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId!),
    enabled: !!taskId,
  });

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

  const selectedTask =
    taskDetail?.data;


  // console.log(`userId : ${user?.id} || memberUserId : ${currentMember?.userId}`)

  const canManageTask =
    currentMember?.role === "LEADER";

  const canUpdateProgress =
    currentMember?.role === "MEMBER" &&
    selectedTask?.assignee?.memberId === currentMember.memberId;

  const loading = tasksLoading || membersLoading;

  const error = tasksError || membersError;

  const taskErrorMessage =
    taskId && taskDetailError
      ? isApiError(taskDetailError)
        ? taskDetailError.message
        : "Failed to load task."
      : null;

  console.log(`taskerrormessage: ${taskErrorMessage}`)

  const handleOpenTask = (task: Task) => {
    const params =
      new URLSearchParams(searchParams);

    params.set(
      "taskId",
      task.id
    );

    router.replace(
      `${pathname}?${params.toString()}`,
      {
        scroll: false,
      }
    );
    // console.log(`selected task active?: ${task.isActive}`)
    // console.log(selectedTask?.title)
  }

  const handleCloseDetailDialog = () => {
    const params =
      new URLSearchParams(searchParams);

    params.delete("taskId");

    router.replace(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname,
      {
        scroll: false,
      }
    );
  }

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
                setTaskStatus(e.target.value)
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
                setSortBy(e.target.value);
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
                );
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
          onOpenTask={handleOpenTask}
          onRetry={() => queryClient.invalidateQueries({
            queryKey: ["projectTasks", projectId],
          })}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters} />
      </div>
      {/* )} */}

      {selectedTask && (
        <TaskDetailDialog
          key={selectedTask.id}
          open={!!selectedTask}
          onClose={handleCloseDetailDialog}
          // mode="owner" // nanti bisa dynamic
          task={selectedTask}
          canManageTask={canManageTask}
          canUpdateProgress={canUpdateProgress}
        />
      )}

      <AddTaskDialog
        isOpen={openAddTaskDialog}
        onClose={() => setOpenAddTaskDialog(false)}
        projectId={projectId}
        projectName={project.name}
      />

      {taskErrorMessage && (
        <ErrorDialog
          message={taskErrorMessage}
          onClose={handleCloseDetailDialog}
        />
      )}

    </div>
  )
}