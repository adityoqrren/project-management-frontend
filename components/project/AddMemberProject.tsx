"use client";

import { useEffect, useState } from "react";
import { SearchUser, searchUsers } from "@/lib/user";
import { addProjectMember } from "@/lib/project";
import { Member } from "@/types/project";
import { invalidateDashboardProjects } from "@/lib/dashboard";
import { useQueryClient } from "@tanstack/react-query";

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  currentMembers: Member[];
  onAdded: () => void;
}

export default function AddMemberDialog({
  open,
  onClose,
  projectId,
  currentMembers,
  onAdded,
}: AddMemberDialogProps) {

  const [keyword, setKeyword] = useState("");

  const [results, setResults] = useState<SearchUser[]>([]);

  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);

  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  // Search users
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(keyword);

        // Remove users already in project
        const filtered = res.data.filter(
          (user) =>
            !currentMembers.some(
              (member) => member.userId === user.id
            )
        );

        setResults(filtered);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword, currentMembers]);

  // Add user to temporary selection
  const handleAddUser = (user: SearchUser) => {

    const alreadySelected = selectedUsers.some(
      (u) => u.id === user.id
    );

    if (alreadySelected) return;

    setSelectedUsers((prev) => [...prev, user]);
  };

  // Remove temporary selected user
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.filter((u) => u.id !== userId)
    );
  };

  // Submit selected users
  const handleConfirm = async () => {
    try {
      setLoading(true);

      await Promise.all(
        selectedUsers.map((user) =>
          addProjectMember({
            userId: user.id,
            projectId,
          })
        )
      );

      onAdded();

      onClose();

      invalidateDashboardProjects(queryClient);

      setSelectedUsers([]);
      setKeyword("");
      setResults([]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Submit selected users
  const handleCancel = async () => {

    onClose();

    setSelectedUsers([]);
    setKeyword("");
    setResults([]);

    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="bg-white w-full max-w-lg rounded-lg p-6 space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Add Members
          </h2>

          <button onClick={handleCancel}>
            ✕
          </button>
        </div>

        {/* Search input */}
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search by username, name, or id..."
          className="w-full border rounded-md px-3 py-2"
        />

        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div className="space-y-2">

            <p className="text-sm font-medium">
              Selected Members
            </p>

            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border rounded-md px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    @{user.username}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}

          </div>
        )}

        {/* Search results */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          <p className="text-sm font-medium">
            Results
          </p>

          {results.map((user) => {

            const alreadySelected = selectedUsers.some(
              (u) => u.id === user.id
            );

            return (
              <div
                key={user.id}
                className="flex items-center justify-between border rounded-md px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    @{user.username}
                  </p>
                </div>

                <button
                  disabled={alreadySelected}
                  onClick={() => handleAddUser(user)}
                  className="text-sm px-3 py-1 rounded bg-black text-white disabled:opacity-50"
                >
                  {alreadySelected ? "Added" : "Add"}
                </button>
              </div>
            );
          })}

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">

          <button
            onClick={handleCancel}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>

          <button
            disabled={selectedUsers.length === 0 || loading}
            onClick={handleConfirm}
            className="px-4 py-2 bg-black text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Adding..." : "Confirm"}
          </button>

        </div>

      </div>

    </div>
  );
}