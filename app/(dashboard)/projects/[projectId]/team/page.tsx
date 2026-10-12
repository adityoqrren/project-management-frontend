"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { getProjectMembers } from "@/lib/project"
import { Member } from "@/types/project"
import MemberDetailDialog from "@/components/project/MemberDetailDialog"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"
import AddMemberDialog from "@/components/project/AddMemberProject"

type FilterType =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE"

export default function ProjectTeamPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth();

  const [filter, setFilter] =
    useState<FilterType>("ALL")

  const [selectedMember, setSelectedMember] =
    useState<Member | null>(null)

  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  });

  const refreshMembers = () => {
    queryClient.invalidateQueries({
      queryKey: ["projectMembers", projectId],
    });
  };

  const members: Member[] = useMemo(() => {
    return (
      membersData?.data.map((m) => ({
        memberId: m.memberId,
        userId: m.userId,
        name: m.name,
        role: m.role === "LEADER" ? "LEADER" : "MEMBER",
        isActive: m.isActive,
      })) ?? []
    );
  }, [membersData]);

  const leader = useMemo(
    () =>
      members.find(
        (member) => member.role === "LEADER"
      ),
    [members]
  )

  const regularMembers = useMemo(
    () =>
      members.filter(
        (member) => member.role === "MEMBER"
      ),
    [members]
  )

  const canManageProject = leader?.userId == user?.id

  const filteredMembers = useMemo(() => {
    switch (filter) {
      case "ACTIVE":
        return regularMembers.filter(
          (member) => member.isActive
        )

      case "INACTIVE":
        return regularMembers.filter(
          (member) => !member.isActive
        )

      default:
        return regularMembers
    }
  }, [regularMembers, filter])

  const activeCount =
    regularMembers.filter(
      (member) => member.isActive
    ).length

  const inactiveCount =
    regularMembers.filter(
      (member) => !member.isActive
    ).length

  if (membersLoading) {
    return (
      <div className="text-gray-400">
        Loading team...
      </div>
    )
  }

  const handleMemberStatusChanged = () => {
    queryClient.invalidateQueries({
      queryKey: ["projectMembers", projectId],
    })
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-semibold">
          Team
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage project members and access.
        </p>
      </div>

      {canManageProject && (
        <button
          onClick={() => setOpen(true)}
          className="text-sm px-3 py-1 rounded bg-black text-white"
        >
          Add Member
        </button>
      )}

      {/* Leader */}

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Leader
        </h2>

        {leader && (
          <div
            onClick={() => setSelectedMember(leader)}
            className="
              border rounded-lg p-4
              cursor-pointer
              hover:bg-gray-50
              transition
            "
          >
            <div className="flex justify-between items-center">

              <div>
                <p className="font-medium">
                  {leader.name}
                </p>

                <p className="text-sm text-gray-500">
                  @{leader.username}
                </p>
              </div>

              <span
                className="
                  px-3 py-1 rounded-full
                  text-xs font-medium
                  bg-blue-100 text-blue-700
                "
              >
                LEADER
              </span>

            </div>
          </div>
        )}
      </section>

      {/* Members */}

      <section>

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-lg font-semibold">
            Members
          </h2>

          <div className="flex gap-2">

            <FilterPill
              active={filter === "ALL"}
              label={`All (${regularMembers.length})`}
              onClick={() => setFilter("ALL")}
            />

            <FilterPill
              active={filter === "ACTIVE"}
              label={`Active (${activeCount})`}
              onClick={() => setFilter("ACTIVE")}
            />

            <FilterPill
              active={filter === "INACTIVE"}
              label={`Inactive (${inactiveCount})`}
              onClick={() => setFilter("INACTIVE")}
            />

          </div>

        </div>

        <div className="space-y-3">

          {filteredMembers.map((member) => (
            <div
              key={member.memberId}
              onClick={() =>
                setSelectedMember(member)
              }
              className="
                border rounded-lg p-4
                cursor-pointer
                hover:bg-gray-50
                transition
              "
            >
              <div className="flex justify-between items-center">

                <div>
                  <p className="font-medium">
                    {member.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    @{member.username}
                  </p>
                </div>

                {member.isActive ? (
                  <span
                    className="
                      px-3 py-1 rounded-full
                      text-xs font-medium
                      bg-green-100 text-green-700
                    "
                  >
                    ACTIVE
                  </span>
                ) : (
                  <span
                    className="
                      px-3 py-1 rounded-full
                      text-xs font-medium
                      bg-red-100 text-red-700
                    "
                  >
                    INACTIVE
                  </span>
                )}

              </div>
            </div>
          ))}

        </div>

      </section>

      {selectedMember && (
        <MemberDetailDialog
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          projectId={projectId}
          canManageProject={canManageProject}
          onStatusChanged={handleMemberStatusChanged} />
      )}

      <AddMemberDialog
        open={open}
        onClose={() => setOpen(false)}
        projectId={projectId}
        currentMembers={members}
        onAdded={refreshMembers}
      />

    </div>
  )
}

interface FilterPillProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterPill({
  label,
  active,
  onClick,
}: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1 rounded-full text-sm transition
        ${active
          ? "bg-black text-white"
          : "bg-gray-100 hover:bg-gray-200"
        }
      `}
    >
      {label}
    </button>
  )
}