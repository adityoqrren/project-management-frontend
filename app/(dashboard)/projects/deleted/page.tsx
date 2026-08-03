"use client";

import { useEffect, useState } from "react";
import { Project, ProjectCreation } from "@/types/project";
import { getProjects, createProject, permanentlyDeleteProject, restoreProject } from "@/lib/project";
import {
  useParams,
  useSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ProjectsTable from "@/components/project/ProjectTable";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { invalidateAfterProjectMutation } from "@/lib/queryInvalidation";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/context/ToastContext";


export default function DeletedProjectsPage() {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const { showToast } = useToast()

  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? ""
  );

  const [search, setSearch] = useState(
    searchParams.get("search") ?? ""
  );

  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") ?? ""
  );

  const [order, setOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") ?? "desc"
  );

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [restoreOpen, setRestoreOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const handleRestore = (project: Project) => {
    setSelectedProject(project);
    setRestoreOpen(true);
  };

  const handlePermanentDelete = (project: Project) => {
    setSelectedProject(project);
    setDeleteOpen(true);
  };

  const closeDialogs = () => {
    setRestoreOpen(false);
    setDeleteOpen(false);
    setSelectedProject(null);
  };

  const restoreMutation = useMutation({
    mutationFn: restoreProject,

    onSuccess: () => {
      invalidateAfterProjectMutation(queryClient);

      closeDialogs();

      showToast('project restored successfully');
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: permanentlyDeleteProject,

    onSuccess: () => {
      invalidateAfterProjectMutation(queryClient);

      closeDialogs();

      showToast('project permanently deleted');
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleRestoreConfirm = () => {
    if (!selectedProject) return;

    restoreMutation.mutate(selectedProject.id);
  };

  const handleDeleteConfirm = () => {
    if (!selectedProject) return;

    deleteMutation.mutate(selectedProject.id);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);

    if (sortBy) params.set("sortBy", sortBy);

    if (order !== "desc") {
      params.set("order", order);
    }

    router.replace(
      `${pathname}?${params.toString()}`,
      { scroll: false }
    );
  }, [
    search,
    sortBy,
    order,
    pathname,
    router,
  ]);

  const {
    data: projectsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "projects",
      {
        status: "deleted",
        search,
        sortBy,
        order,
      },
    ],

    queryFn: () =>
      getProjects({
        status: "deleted",
        search: search || undefined,
        sortBy: sortBy || undefined,
        order,
      }),

    placeholderData: keepPreviousData,
  });

  const projects = projectsData?.data ?? [];

  const hasActiveFilters =
    Boolean(search);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* Back */}
      <Link
        href="/projects"
        className="
          inline-flex
          items-center
          text-sm
          text-gray-500
          hover:text-black
        "
      >
        <ArrowLeft className="size-4" /> View active projects
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Deleted projects
        </h1>

        <p className="text-sm text-gray-500">
          {projects.length} deleted projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">

        <div className="relative flex-1">

          <input
            value={searchInput}
            onChange={(e) =>
              setSearchInput(e.target.value)
            }
            placeholder="Search deleted projects..."
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
              "
            >
              ✕
            </button>
          )}

        </div>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
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

          <option value="deletedAt">
            Deleted Date
          </option>

        </select>

        <select
          value={order}
          onChange={(e) =>
            setOrder(
              e.target.value as "asc" | "desc"
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
              setSearch("");
              setSearchInput("");
            }}
            className="
              px-3
              py-2
              border
              rounded-md
            "
          >
            Clear Filters
          </button>
        )}

      </div>

      {/* Table */}

      {isLoading ? (

        <div className="text-center py-10 text-gray-400">
          Loading deleted projects...
        </div>

      ) : error ? (

        <div className="text-center py-10 text-red-500">
          Failed to load deleted projects
        </div>

      ) : projects.length === 0 ? (

        <div className="text-center py-10 text-gray-400">
          {hasActiveFilters
            ? "No deleted projects match your filters."
            : "No deleted projects."}
        </div>

      ) : (

        <ProjectsTable
          projects={projects}
          mode="deleted"
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
        />

      )}

      <ConfirmDialog
        open={restoreOpen}
        title="Restore project"
        description={
          <>
            Project <strong>{selectedProject?.name}</strong> will become active again.
          </>
        }
        confirmLabel="Restore"
        loadingLabel="Restoring..."
        loading={restoreMutation.isPending}
        onConfirm={handleRestoreConfirm}
        onCancel={() => setRestoreOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete project permanently"
        description={
          <>
            <strong>{selectedProject?.name}</strong> will be permanently deleted.
            <br />
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        confirmVariant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
      />

    </div>
  );
}