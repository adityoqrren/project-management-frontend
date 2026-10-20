"use client";

import Image from "next/image";
import { getInitials } from "@/lib/getInitials";
import { getAvatarColor } from "@/lib/getAvatarColor";
import { useAuth } from "@/context/AuthContext";

interface ProfileSectionProps {
  onEditName: () => void;
  onEditPhoto: () => void;
  onRemovePhoto: () => void;
}

export default function ProfileSection({
  onEditName,
  onEditPhoto,
  onRemovePhoto,
}: ProfileSectionProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const avatarColor = getAvatarColor(user.id);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile information.
        </p>
      </div>

      {/* Profile photo */}
      <div className="flex items-center gap-5">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center
            overflow-hidden rounded-full text-xl font-semibold ring-1 ${avatarColor}`}
        >
          {user.photoProfile ? (
            <Image
              src={user.photoProfile}
              alt={`${user.name}'s profile`}
              width={80}
              height={80}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(user.name)
          )}
        </div>

        <div className="space-y-2">
          <p className="font-medium">Profile photo</p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onEditPhoto}
              className="rounded-md border px-3 py-2 text-sm font-medium
                hover:bg-gray-50"
            >
              {user.photoProfile ? "Change photo" : "Add photo"}
            </button>

            {user.photoProfile && (
              <button
                type="button"
                onClick={onRemovePhoto}
                className="rounded-md px-3 py-2 text-sm font-medium
                  text-red-600 hover:bg-red-50"
              >
                Remove photo
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            JPEG, PNG, or WebP. Maximum upload size: 2 MB after processing.
          </p>
        </div>
      </div>

      <div className="border-t" />

      {/* Full name */}
      <ProfileField
        label="Full name"
        value={user.name}
        onEdit={onEditName}
      />

      {/* Username */}
      <ProfileField
        label="Username"
        value={user.username}
        disabled
      />

      {/* Email */}
      <ProfileField
        label="Email"
        value={user.email}
        disabled
      />
    </section>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string;
  onEdit?: () => void;
  disabled?: boolean;
}

function ProfileField({
  label,
  value,
  onEdit,
  disabled = false,
}: ProfileFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 break-words font-medium">{value}</p>
      </div>

      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        className="shrink-0 rounded-md border px-3 py-2 text-sm font-medium
          hover:bg-gray-50 disabled:cursor-not-allowed
          disabled:opacity-50"
      >
        Edit
      </button>
    </div>
  );
}