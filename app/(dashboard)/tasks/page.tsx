"use client"

import TaskDetailDialog from "@/components/task/TaskDetailDialog"
import TasksTable from "@/components/task/TaskTable"
import { useAuth } from "@/context/AuthContext"
import { getProjectMembers, getProjects } from "@/lib/project"
import { getMyTasks } from "@/lib/task"
import { Task } from "@/types/task"
import {
  useSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { createEmptyPagination } from "@/components/common/Pagination"

export default function TasksPage() {

  const router = useRouter();

  const pathname = usePathname();

  const searchParams =
    useSearchParams();


  const queryClient = useQueryClient();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [openDetailTaskDialog, setOpenDetailTaskDialog] = useState(false)
  const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false)

  const [projectId, setProjectId] =
    useState(
      searchParams.get("projectId") ?? ""
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


  const { user } = useAuth();

  const hasActiveFilters = Boolean(
    search ||
    projectId ||
    taskStatus ||
    priority
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const params =
      new URLSearchParams();

    if (search)
      params.set("search", search);

    if (projectId)
      params.set("projectId", projectId);

    if (taskStatus)
      params.set(
        "taskStatus",
        taskStatus
      );

    if (priority)
      params.set(
        "priority",
        priority
      );

    if (sortBy)
      params.set(
        "sortBy",
        sortBy
      );

    if (order !== "asc")
      params.set(
        "order",
        order
      );

    router.replace(
      `${pathname}?${params.toString()}`,
      {
        scroll: false,
      }
    );
  }, [
    search,
    projectId,
    taskStatus,
    priority,
    sortBy,
    order,
    page,
    limit,
    pathname,
    router,
  ]);

  // Fetch tasks from API
  const {
    data: tasksData,
    isLoading: tasksLoading,
    isFetching: tasksFetching,
    error: tasksError,
  } = useQuery({
    queryKey: [
      "myTasks",
      projectId,
      search,
      taskStatus,
      priority,
      sortBy,
      order,
      page,
      limit,
    ],
    queryFn: () =>
      getMyTasks({
        search: search || undefined,
        projectId: projectId || undefined,
        taskStatus: taskStatus || undefined,
        priority: priority || undefined,
        sortBy: sortBy || undefined,
        page: page || undefined,
        limit: limit || undefined,
        order,
      }),
    placeholderData: keepPreviousData,
  })

  const {
    data: projectsData,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects({}),
  })

  const {
    data: membersData,
  } = useQuery({
    queryKey: [
      "projectMembers",
      selectedTask?.project.id,
    ],
    queryFn: () =>
      getProjectMembers(
        selectedTask!.project.id
      ),
    enabled: !!selectedTask,
  })

  const projects = projectsData?.data ?? [];

  const tasks = tasksData?.data ?? [];
  const pagination =
    tasksData?.pagination
      ? {
        ...tasksData.pagination,
        page,
        limit,
      }
      : createEmptyPagination(limit);

  const currentMember =
    membersData?.data.find(
      (m) => m.userId === user?.id
    );

  const canManageTask =
    currentMember?.role === "LEADER";

  const canUpdateProgress =
    currentMember?.role === "MEMBER" &&
    selectedTask?.assignee?.memberId === currentMember.memberId;

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task)
    console.log(`selected task title: ${task.title}`)
    console.log(selectedTask?.title)
    setOpenDetailTaskDialog(true)
  }

  const handleCloseDetailDialog = () => {
    setSelectedTask(null)
    setOpenDetailTaskDialog(false)
  }

  const handleClearFilters = () => {
    setProjectId("");
    setTaskStatus("");
    setPriority("");
    setSearch("");
    setSearchInput("");
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-semibold">
            My Tasks
          </h1>

          {/* <button
          onClick={() => setOpenAddTaskDialog(true)}
          className="bg-black text-white px-4 py-2 rounded-md"
        >
          Add Task
        </button> */}

        </div>

        <div className="mb-6 space-y-3">

          {/* Search placeholder for future */}
          {/* 
  <input
    placeholder="Search tasks..."
    className="
      w-full
      border rounded-md
      px-3 py-2
      text-sm
    "
  />
  */}

          <div
            className="
      flex flex-col lg:flex-row
      lg:items-center
      lg:justify-between
      gap-3
    "
          >

            {/* LEFT SIDE - FILTERS */}
            <div
              className="
        flex flex-col
        sm:flex-row
        gap-3
      "
            >

              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="
          border rounded-md px-3 py-2
          bg-white text-sm
          min-w-[220px]
        "
              >
                <option value="">
                  All Projects
                </option>

                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ))}
              </select>

              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
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

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
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

            </div>

            {/* RIGHT SIDE - SORTING */}
            <div
              className="
        flex flex-col
        sm:flex-row
        gap-3
      "
            >

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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

                <option value="project_name">
                  Project Name
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
                onChange={(e) =>
                  setOrder(e.target.value as "asc" | "desc")
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

          <div className="flex flex-row justify-between">
            {/* SEARCH BAR */}
            <div className="relative lg:min-w-[320px]">
              <input
                type="text"
                value={searchInput}
                onChange={(e) =>
                  setSearchInput(e.target.value)
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

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setProjectId("");
                  setTaskStatus("");
                  setPriority("");
                  setSearch("");
                  setSearchInput("");
                }}
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

        </div>

        {/* {tasks.length === 0 && !hasActiveFilters ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border text-gray-400">
          No tasks yet. Create your first task.
        </div>
      ) : (tasks.length === 0 && hasActiveFilters) ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border text-gray-400">
          No tasks match your filters.
        </div>
      ) :
        ( */}
        <div className="flex-1 min-h-0">
          <TasksTable
            tasks={tasks}
            pagination={pagination}
            loading={tasksLoading}
            error={tasksError as Error | null}
            fetching={tasksFetching}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onOpenTask={handleOpenTask}
            onRetry={() => queryClient.invalidateQueries({
              queryKey: ["myTasks", projectId],
            })}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters} />
        </div>
        {/* )} */}

        {selectedTask && (
          <TaskDetailDialog
            key={selectedTask.id}
            open={openDetailTaskDialog}
            onClose={handleCloseDetailDialog}
            // mode="owner" // nanti bisa dynamic
            task={selectedTask}
            canManageTask={canManageTask}
            canUpdateProgress={canUpdateProgress}
          />
        )}

      </div>
    </div>
  )
}