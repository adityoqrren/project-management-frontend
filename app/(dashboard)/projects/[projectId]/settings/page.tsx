"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import GeneralSettingsCard from "@/components/project/settings/GeneralSettingsCard";
import DangerZoneCard from "@/components/project/settings/DangerZoneCard";
import { getProjectById, softDeleteProject, updateProject } from "@/lib/project";
import { useState } from "react";
import { ProjectCreation } from "@/types/project";
import { invalidateAfterProjectMutation } from "@/lib/queryInvalidation";
import { useToast } from "@/context/ToastContext";
import ProjectFormDialog from "@/components/project/ProjectFormDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function ProjectSettingsPage() {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [openEditDialog, setOpenEditDialog] =
    useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] =
    useState(false);

  const { showToast } = useToast()

  const router = useRouter();

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProjectById(projectId),
  });

  const updateProjectMutation = useMutation({
    mutationFn: (project: ProjectCreation) =>
      updateProject(projectId, project),

    onSuccess: async ({ message }) => {
      showToast(message);

      await invalidateAfterProjectMutation(queryClient);

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

  const handleUpdate = (
    project: ProjectCreation
  ) => {
    updateProjectMutation.mutate(project);
  };

  const handleDeleteProject = () => {
    softDeleteProjectMutation.mutate();
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

  const project = data?.data;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      <div>
        <h1 className="text-2xl font-semibold">
          Project Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage project information and administrative actions.
        </p>
      </div>

      <GeneralSettingsCard
        project={project}
        onEdit={() => setOpenEditDialog(true)} />

      <DangerZoneCard onDelete={() => setOpenDeleteDialog(true)} />


      {openEditDialog && (
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
    </div>
  );
}
