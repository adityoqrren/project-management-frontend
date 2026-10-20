"use client";

import { useState } from "react";
import ProfileSection from "@/components/settings/ProfileSection";
import { useAuth } from "@/context/AuthContext";
import EditFullNameDialog from "@/components/settings/EditFullNameDialog";
import PhotoProfileDialog from "@/components/settings/PhotoProfileDialog";
import { ToastType, useToast } from "@/context/ToastContext";
import { deleteMyProfilePhoto, updateMyProfile, uploadMyProfilePhoto } from "@/lib/user";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function SettingsPage() {
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isRemovePhotoDialogOpen, setIsRemovePhotoDialogOpen] =
    useState(false);

  const { user, setUser, refetchUser } = useAuth();
  const { showToast } = useToast();

  async function handleSaveName(name: string) {
    try {
      await updateMyProfile({ name });

      await refetchUser();
      setIsEditNameOpen(false);

      showToast("Your name has been updated successfully.");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to update your name.",
        ToastType.error
      );
    }
  }

  async function handleSavePhoto(file: File) {
    try {
      await uploadMyProfilePhoto(file);

      // Refresh the user to obtain a fresh presigned photo URL.
      await refetchUser();

      setIsPhotoDialogOpen(false);

      showToast(
        "Your profile photo has been updated.",
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to upload your profile photo.",
      );

      throw error;
    }
  }

  async function handleRemovePhoto() {
    try {
      await deleteMyProfilePhoto();

      await refetchUser();

      setIsRemovePhotoDialogOpen(false);

      showToast("Your profile photo has been removed.");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to remove your profile photo.",
        ToastType.error
      );
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings.
        </p>
      </div>

      <ProfileSection
        onEditName={() => setIsEditNameOpen(true)}
        onEditPhoto={() => setIsPhotoDialogOpen(true)}
        onRemovePhoto={() => setIsRemovePhotoDialogOpen(true)}
      />

      {isEditNameOpen && user && (
        <EditFullNameDialog
          currentName={user.name}
          onClose={() => setIsEditNameOpen(false)}
          onSave={handleSaveName}
        />
      )}

      {isPhotoDialogOpen && (
        <PhotoProfileDialog
          onClose={() => setIsPhotoDialogOpen(false)}
          onSave={handleSavePhoto}
        />
      )}

      <ConfirmDialog
        open={isRemovePhotoDialogOpen}
        title={"Remove Photo Profile"}
        description={"Are you sure want to remove your profile photo?"}
        onCancel={() => setIsRemovePhotoDialogOpen(false)}
        onConfirm={handleRemovePhoto} />
        
    </main>
  );
}