"use client";

import { useEffect, useState } from "react";
import { Project, ProjectCreation } from "@/types/project";
import { getProjects, createProject, permanentlyDeleteProject, restoreProject, softDeleteProject, unarchiveProject } from "@/lib/project";
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


type ProjectTab = "archived" | "deleted";

export default function ArchivedAndDeletedProjectsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const initialTab: ProjectTab =
    searchParams.get("tab") === "deleted"
      ? "deleted"
      : "archived";

  const [activeTab, setActiveTab] =
    useState<ProjectTab>(initialTab);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? ""
  );

  const [search, setSearch] = useState(
    searchParams.get("search") ?? ""
  );

  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") ??
    (initialTab === "archived" ? "archivedAt" : "deletedAt")
  );

  const [order, setOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") ?? "desc"
  );

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [unarchiveOpen, setUnarchiveOpen] = useState(false);
  const [softDeleteOpen, setSoftDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [permanentDeleteOpen, setPermanentDeleteOpen] =
    useState(false);

  const handleTabChange = (tab: ProjectTab) => {
    setActiveTab(tab);
    setSortBy(tab === "archived" ? "archivedAt" : "deletedAt");
  };

  const handleUnarchive = (project: Project) => {
    setSelectedProject(project);
    setUnarchiveOpen(true);
  };

  const handleSoftDelete = (project: Project) => {
    setSelectedProject(project);
    setSoftDeleteOpen(true);
  };

  const handleRestore = (project: Project) => {
    setSelectedProject(project);
    setRestoreOpen(true);
  };

  const handlePermanentDelete = (project: Project) => {
    setSelectedProject(project);
    setPermanentDeleteOpen(true);
  };

  const closeDialogs = () => {
    setUnarchiveOpen(false);
    setSoftDeleteOpen(false);
    setRestoreOpen(false);
    setPermanentDeleteOpen(false);
    setSelectedProject(null);
  };

  // Unarchive a project and return it to the active projects list.
  const unarchiveMutation = useMutation({
    mutationFn: unarchiveProject,

    onSuccess: async ({ message }) => {
      await invalidateAfterProjectMutation(queryClient);

      await queryClient.invalidateQueries({
        queryKey: ["projects", selectedProject?.id],
      });

      closeDialogs();
      showToast(message);
    },

    onError: (error) => {
      console.error(error);
    },
  });

  // Move an archived project to the deleted projects list.
  const softDeleteMutation = useMutation({
    mutationFn: softDeleteProject,

    onSuccess: async ({ message }) => {
      await invalidateAfterProjectMutation(queryClient);

      closeDialogs();
      showToast(message);
    },

    onError: (error) => {
      console.error(error);
    },
  });

  // Restore a deleted project to its previous lifecycle state.
  const restoreMutation = useMutation({
    mutationFn: restoreProject,

    onSuccess: async () => {
      await invalidateAfterProjectMutation(queryClient);

      closeDialogs();
      showToast("Project restored successfully");
    },

    onError: (error) => {
      console.error(error);
    },
  });

  // Permanently delete a project.
  const permanentDeleteMutation = useMutation({
    mutationFn: permanentlyDeleteProject,

    onSuccess: async () => {
      await invalidateAfterProjectMutation(queryClient);

      closeDialogs();
      showToast("Project permanently deleted");
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleUnarchiveConfirm = () => {
    if (!selectedProject) return;

    unarchiveMutation.mutate(selectedProject.id);
  };

  const handleSoftDeleteConfirm = () => {
    if (!selectedProject) return;

    softDeleteMutation.mutate(selectedProject.id);
  };

  const handleRestoreConfirm = () => {
    if (!selectedProject) return;

    restoreMutation.mutate(selectedProject.id);
  };

  const handlePermanentDeleteConfirm = () => {
    if (!selectedProject) return;

    permanentDeleteMutation.mutate(selectedProject.id);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const params = new URLSearchParams();

    params.set("tab", activeTab);

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
    activeTab,
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
        status: activeTab,
        search,
        sortBy,
        order,
      },
    ],

    queryFn: () =>
      getProjects({
        status: activeTab,
        search: search || undefined,
        sortBy: sortBy || undefined,
        order,
      }),

    placeholderData: keepPreviousData,
  });

  const projects = projectsData?.data ?? [];

  const hasActiveFilters = Boolean(search);

  const isArchivedTab = activeTab === "archived";

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Back */}
        <Link
          href="/projects"
          className="
          inline-flex
          items-center
          gap-1
          text-sm
          text-gray-500
          hover:text-black
        "
        >
          <ArrowLeft className="size-4" />
          View active projects
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">
            Archived and Deleted Projects
          </h1>

          <p className="text-sm text-gray-500">
            Manage your archived and deleted projects.
          </p>
        </div>

        {/* Tabs */}
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

        {/* Project count */}
        <p className="text-sm text-gray-500">
          {projects.length} {activeTab} projects
        </p>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search ${activeTab} projects...`}
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
            onChange={(e) => setSortBy(e.target.value)}
            className="
            border
            rounded-md
            px-3
            py-2
            min-w-[180px]
          "
          >
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="createdAt">Created Date</option>
            <option value={isArchivedTab ? "archivedAt" : "deletedAt"}>
              {isArchivedTab ? "Archived Date" : "Deleted Date"}
            </option>
          </select>

          <select
            value={order}
            onChange={(e) =>
              setOrder(e.target.value as "asc" | "desc")
            }
            className="
            border
            rounded-md
            px-3
            py-2
            min-w-[160px]
          "
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
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

        {/* Project table */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">
            Loading {activeTab} projects...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            Failed to load {activeTab} projects.
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            {hasActiveFilters
              ? `No ${activeTab} projects match your filters.`
              : `No ${activeTab} projects.`}
          </div>
        ) : (
          <ProjectsTable
            projects={projects}
            mode={activeTab}
            onUnarchive={handleUnarchive}
            onSoftDelete={handleSoftDelete}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        )}

        {/* Unarchive confirmation */}
        <ConfirmDialog
          open={unarchiveOpen}
          title="Unarchive Project?"
          description={
            <>
              Project <strong>{selectedProject?.name}</strong> will become
              active again.
            </>
          }
          confirmLabel="Unarchive"
          loadingLabel="Unarchiving..."
          loading={unarchiveMutation.isPending}
          onConfirm={handleUnarchiveConfirm}
          onCancel={closeDialogs}
        />

        {/* Soft delete confirmation */}
        <ConfirmDialog
          open={softDeleteOpen}
          title="Delete Project?"
          description={
            <>
              Project <strong>{selectedProject?.name}</strong> will be moved
              to Deleted Projects. You can restore it later.
            </>
          }
          confirmLabel="Delete"
          loadingLabel="Deleting..."
          confirmVariant="destructive"
          loading={softDeleteMutation.isPending}
          onConfirm={handleSoftDeleteConfirm}
          onCancel={closeDialogs}
        />

        {/* Restore confirmation */}
        <ConfirmDialog
          open={restoreOpen}
          title="Restore Project?"
          description={
            <>
              Project <strong>{selectedProject?.name}</strong> will be restored
              to{" "}
              <strong>
                {selectedProject?.archivedAt ? "Archived" : "Active"}
              </strong>
              .
            </>
          }
          confirmLabel="Restore"
          loadingLabel="Restoring..."
          loading={restoreMutation.isPending}
          onConfirm={handleRestoreConfirm}
          onCancel={closeDialogs}
        />

        {/* Permanent delete confirmation */}
        <ConfirmDialog
          open={permanentDeleteOpen}
          title="Delete Project Permanently?"
          description={
            <>
              <strong>{selectedProject?.name}</strong> will be permanently
              deleted.
              <br />
              This action cannot be undone.
            </>
          }
          confirmLabel="Delete Permanently"
          loadingLabel="Deleting..."
          confirmVariant="destructive"
          loading={permanentDeleteMutation.isPending}
          onConfirm={handlePermanentDeleteConfirm}
          onCancel={closeDialogs}
        />
      </div>
    </div>
  );
}