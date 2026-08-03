"use client";

import { Member } from "@/types/project";
import { useState } from "react";
import AddMemberDialog from "./AddMemberProject";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface TeamMembersCardProps {
  members: Member[];
  projectId: string;
  onRefresh: () => void;
  canManageProject: boolean;
}

export default function TeamMembersCard({
  members,
  projectId,
  onRefresh,
  canManageProject
}: TeamMembersCardProps) {

  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // Sort leader first
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === "LEADER" && b.role !== "LEADER") {
      return -1;
    }

    if (a.role !== "LEADER" && b.role === "LEADER") {
      return 1;
    }

    return 0;
  });

  const previewMembers =
    sortedMembers.slice(0, 5);

  const hiddenMembers =
    sortedMembers.length - previewMembers.length;

  return (
    <div className="border rounded-lg p-4">

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-lg font-semibold">
          Team Members
        </h2>

        {canManageProject && (
          <button
            onClick={() => setOpen(true)}
            className="text-sm px-3 py-1 rounded bg-black text-white"
          >
            Add Member
          </button>
        )}

      </div>

      <div className="space-y-3">

        {previewMembers.map((member) => {

          const isCurrentUser =
            member.userId === user?.id;

          return (
            <div
              key={member.memberId}
              className={`flex items-center justify-between rounded-md px-3 py-2
          ${isCurrentUser ? "bg-green-50 border border-green-200" : ""}
        `}
            >
              <div>

                <span className="font-medium">
                  {member.name}
                </span>

                {isCurrentUser && (
                  <span className="ml-2 text-xs text-green-600">
                    (You)
                  </span>
                )}

              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-medium
    ${member.role === "LEADER"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                  }
  `}
              >
                {member.role === "LEADER" ? "Leader" : "Member"}
              </span>
            </div>
          );
        }
        )}

        {hiddenMembers > 0 && (
          <Link
            href={`/projects/${projectId}/team`}
            className="
      inline-block
      mt-4
      text-sm
      text-blue-600
      hover:underline
    "
          >
            +{hiddenMembers} more →
          </Link>
        )}

      </div>

      <AddMemberDialog
        open={open}
        onClose={() => setOpen(false)}
        projectId={projectId}
        currentMembers={members}
        onAdded={onRefresh}
      />

    </div>
  );
}