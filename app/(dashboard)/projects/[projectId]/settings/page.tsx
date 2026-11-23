"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import GeneralSettingsCard from "@/components/project/settings/GeneralSettingsCard";
import DangerZoneCard from "@/components/project/settings/DangerZoneCard";
import { archiveProject, getProjectById, softDeleteProject, unarchiveProject, updateProject } from "@/lib/project";
import { useState } from "react";
import { ProjectCreation } from "@/types/project";
import { invalidateAfterProjectMutation } from "@/lib/queryInvalidation";
import { useToast } from "@/context/ToastContext";
import ProjectFormDialog from "@/components/project/ProjectFormDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatDateLocal } from "@/utils/formatter";
import { useAuth } from "@/context/AuthContext";


export default function ProjectSettingsPage() {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [openUnarchiveDialog, setOpenUnarchiveDialog] = useState(false);

  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
  });

  const updateProjectMutation = useMutation({
    mutationFn: (project: ProjectCreation) =>
      updateProject(projectId, project),

    onSuccess: async ({ message }) => {
      showToast(message);

      await invalidateAfterProjectMutation(queryClient);
      await queryClient.invalidateQueries({
        queryKey: ["projects", projectId],
      });

      setOpenEditDialog(false);
    },
  });

  const softDeleteProjectMutation = useMutation({
    mutationFn: () => softDeleteProject(projectId),

    onSuccess: async ({ message }) => {
      showToast(message);

      await invalidateAfterProjectMutation(queryClient);

      router.replace("/projects");
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const archiveProjectMutation = useMutation({
    mutationFn: () => archiveProject(projectId),

    onSuccess: async ({ message }) => {
      showToast(message);

      await invalidateAfterProjectMutation(queryClient);
      await queryClient.invalidateQueries({
        queryKey: ["projects", projectId],
      });

      setOpenArchiveDialog(false);
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const unarchiveProjectMutation = useMutation({
    mutationFn: () => unarchiveProject(projectId),

    onSuccess: async ({ message }) => {
      showToast(message);

      await invalidateAfterProjectMutation(queryClient);
      await queryClient.invalidateQueries({
        queryKey: ["projects", projectId],
      });

      setOpenUnarchiveDialog(false);
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleUpdate = (project: ProjectCreation) => {
    updateProjectMutation.mutate(project);
  };

  const handleDeleteProject = () => {
    softDeleteProjectMutation.mutate();
  };

  const handleArchiveProject = () => {
    archiveProjectMutation.mutate();
  };

  const handleUnarchiveProject = () => {
    unarchiveProjectMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        Loading project...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-red-500">
        Failed to load project.
      </div>
    );
  }

  const project = data.data;
  const isArchived = Boolean(project.archivedAt);

  const canManageProject = project.owner === user?.id;

  if (!canManageProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            403 - Forbidden
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            You don&apos;t have permission to access project settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Project Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage project information and administrative actions.
        </p>

        {isArchived && (
          <p className="mt-3 text-sm text-orange-600">
            This project is archived. Project information is read-only
            until it is unarchived.
          </p>
        )}
      </div>

      <GeneralSettingsCard
        project={project}
        onEdit={
          isArchived
            ? undefined
            : () => setOpenEditDialog(true)
        }
      />

      <section className="border border-orange-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-orange-600">
          {isArchived ? "Archived Project" : "Archive Project"}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {isArchived
            ? "Unarchive this project to make it active again and allow project changes."
            : "Archive this project when it is no longer active. You can still access its information and tasks, but they will become read-only."}
        </p>

        {isArchived && project.archivedAt && (
          <p className="mt-3 text-xs text-gray-500">
            Archived on: {formatDateLocal(project.archivedAt)}
          </p>
        )}

        <button
          onClick={() =>
            isArchived
              ? setOpenUnarchiveDialog(true)
              : setOpenArchiveDialog(true)
          }
          disabled={
            archiveProjectMutation.isPending ||
            unarchiveProjectMutation.isPending
          }
          className="
            mt-6
            px-4
            py-2
            rounded-md
            bg-orange-500
            text-white
            hover:bg-orange-600
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {isArchived ? "Unarchive Project" : "Archive Project"}
        </button>
      </section>

      <DangerZoneCard
        onDelete={() => setOpenDeleteDialog(true)}
        loading={softDeleteProjectMutation.isPending}
      />

      {!isArchived && openEditDialog && (
        <ProjectFormDialog
          title="Edit Project"
          submitLabel="Save Changes"
          loadingLabel="Saving Changes"
          loading={updateProjectMutation.isPending}
          initialValues={{
            name: project.name,
            description: project.description ?? "",
          }}
          onClose={() => setOpenEditDialog(false)}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmDialog
        open={openDeleteDialog}
        title="Delete Project?"
        description="This project will be moved to Deleted Projects. You can restore it later."
        confirmLabel="Delete Project"
        confirmVariant="destructive"
        loading={softDeleteProjectMutation.isPending}
        loadingLabel="Deleting Project..."
        onCancel={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteProject}
      />

      <ConfirmDialog
        open={openArchiveDialog}
        title="Archive Project?"
        description="This project will be archived. You and other project members can still access its information and tasks, but project-related changes will be unavailable until it is unarchived."
        confirmLabel="Archive Project"
        loading={archiveProjectMutation.isPending}
        loadingLabel="Archiving Project..."
        onCancel={() => setOpenArchiveDialog(false)}
        onConfirm={handleArchiveProject}
      />

      <ConfirmDialog
        open={openUnarchiveDialog}
        title="Unarchive Project?"
        description="This project will become active again. Project members will be able to make changes according to their roles and permissions."
        confirmLabel="Unarchive Project"
        loading={unarchiveProjectMutation.isPending}
        loadingLabel="Unarchiving Project..."
        onCancel={() => setOpenUnarchiveDialog(false)}
        onConfirm={handleUnarchiveProject}
      />
    </div>
  );
}
