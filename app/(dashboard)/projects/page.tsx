"use client";

import { useEffect, useState } from "react";
import ProjectTable from "@/components/project/ProjectTable";
import { ProjectCreation } from "@/types/project";
import { getProjects, createProject } from "@/lib/project";
import {
  useSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProjectFormDialog from "@/components/project/ProjectFormDialog";
import { ToastType, useToast } from "@/context/ToastContext";


export default function ProjectsPage() {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const { showToast } = useToast()

  const [searchInput, setSearchInput] =
    useState(
      searchParams.get("search") ?? ""
    );

  const [search, setSearch] =
    useState(
      searchParams.get("search") ?? ""
    );

  const [role, setRole] =
    useState(
      searchParams.get("role") ?? ""
    );

  const [sortBy, setSortBy] =
    useState(
      searchParams.get("sortBy") ?? ""
    );

  const [order, setOrder] =
    useState<"asc" | "desc">(
      (searchParams.get("order") as "asc" | "desc") ?? "asc"
    );

  // Debounce Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // URL Sync
  useEffect(() => {
    const params =
      new URLSearchParams();

    if (search)
      params.set("search", search);

    if (role)
      params.set("role", role);

    if (sortBy)
      params.set("sortBy", sortBy);

    if (order !== "asc")
      params.set("order", order);

    router.replace(
      `${pathname}?${params.toString()}`,
      {
        scroll: false,
      }
    );
  }, [
    search,
    role,
    sortBy,
    order,
    pathname,
    router,
  ]);

  // 🔥 FETCH PROJECTS (Query)
  const {
    data: projectsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "projects",
      search,
      role,
      sortBy,
      order,
    ],

    queryFn: () =>
      getProjects({
        search:
          search || undefined,

        role:
          role || undefined,

        sortBy:
          sortBy || undefined,

        order,
      }),

    placeholderData:
      keepPreviousData,
  });

  const queryClient =
    useQueryClient();

  // Create Project Mutation
  const createProjectMutation =
    useMutation({
      mutationFn: createProject,

      onSuccess: () => {
        showToast('Project created successfully');

        queryClient.invalidateQueries({
          queryKey: ["projects"],
        });
        queryClient.invalidateQueries({
          queryKey: ["dashboardProjects"],
        });
        setOpen(false)
      },

      onError: (error) => {
        showToast('Failed create project', ToastType.error);
        console.error(error);
      },
    });

  const projects =
    projectsData?.data ?? [];

  const hasActiveFilters =
    Boolean(
      search ||
      role
    );

  // 🔥 HANDLE CREATE
  const handleCreate = (
    newProject: ProjectCreation
  ) => {
    createProjectMutation.mutate({
      name: newProject.name,
      description: newProject.description,
    }
    );
  };


  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              My projects
            </h1>

            <p className="text-sm text-gray-500">
              {projects.length} active projects belong to you
            </p>

            <Link
              href="/projects/deleted"
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
              View deleted projects
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setOpen(true)}
          >
            + Create project
          </button>
        </div>

        {/* Filters */}
        <div
          className="
    flex flex-col
    lg:flex-row
    gap-3
  "
        >

          {/* Search */}
          <div className="relative flex-1">

            <input
              value={searchInput}
              onChange={(e) =>
                setSearchInput(
                  e.target.value
                )
              }
              placeholder="Search projects..."
              className="
        w-full
        border
        rounded-md
        px-3
        py-2
        pr-10
      "
            />

            {searchInput && (
              <button
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
          hover:text-gray-600
        "
              >
                ✕
              </button>
            )}

          </div>

          {/* Role */}
          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value
              )
            }
            className="
      border
      rounded-md
      px-3
      py-2
      min-w-[180px]
    "
          >
            <option value="">
              All Roles
            </option>

            <option value="LEADER">
              Leader
            </option>

            <option value="MEMBER">
              Member
            </option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
            className="
      border
      rounded-md
      px-3
      py-2
      min-w-[180px]
    "
          >
            <option value="">
              Sort By
            </option>

            <option value="name">
              Name
            </option>

            <option value="createdAt">
              Created Date
            </option>

            <option value="lastActivityAt">
              Updated Date
            </option>
          </select>

          {/* Order */}
          <select
            value={order}
            onChange={(e) =>
              setOrder(
                e.target.value as
                "asc" | "desc"
              )
            }
            className="
      border
      rounded-md
      px-3
      py-2
      min-w-[160px]
    "
          >
            <option value="asc">
              Ascending
            </option>

            <option value="desc">
              Descending
            </option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setRole("");
              }}
              className="
        px-3 py-2
        border rounded-md
        text-sm
        text-gray-600
        hover:bg-red-50
        hover:text-red-600
      "
            >
              Clear Filters
            </button>
          )}

        </div>

        {/* Table */}
        {isLoading ? (

          <div className="text-center py-10 text-gray-400">
            Loading projects...
          </div>

        ) : error ? (

          <div className="text-center py-10 text-red-500">
            Failed to load projects
          </div>

        ) : projects.length === 0 ? (

          <div className="text-center py-10 text-gray-400">
            {hasActiveFilters
              ? "No projects match your filters"
              : "No projects yet. Create your first project"}
          </div>

        ) : (

          <ProjectTable
            projects={projects}
          />

        )}

        {/* Dialog */}
        {open && (
          <ProjectFormDialog
            onClose={() => setOpen(false)}
            onSubmit={handleCreate} // 🔥 pakai API
            title={"Create New Project"}
            submitLabel={"Create"}
            loadingLabel={"Creating Project"} />
        )}

      </div>
    </div>
  );
}