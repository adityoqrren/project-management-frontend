"use client"

import Modal from "@/components/ui/Modal"
import { ApiError } from "@/lib/errors"
import { updateMemberActiveStatus } from "@/lib/project"
import { Member } from "@/types/project"
import { useState } from "react"
import { useToast } from "@/context/ToastContext"

interface Props {
  projectId: string
  member: Member
  onClose: () => void
  onStatusChanged: (
    memberId: string,
    isActive: boolean
  ) => void
}

export default function MemberDetailDialog({
  projectId,
  member,
  onClose,
  onStatusChanged
}: Props) {
  const isLeader =
    member.role === "LEADER"

  const [loading, setLoading] = useState(false)


  const { showToast } = useToast()

  const handleToggleStatus = async () => {
    try {
      setLoading(true)

      const newStatus = !member.isActive

      await updateMemberActiveStatus(
        projectId,
        member.memberId,
        newStatus
      )

      onStatusChanged(
        member.memberId,
        newStatus
      )

      onClose()

      showToast(
        newStatus
          ? "Member activated successfully"
          : "Member inactivated successfully"
      )

    } catch (error) {
      //console.error(error)

      if (error instanceof ApiError) {
        showToast(error.message, "error")
      } else {
        showToast(
          "Failed to update member status",
          "error"
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose}>

      <div className="p-6 w-[500px]">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Member Detail
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">

          <InfoRow
            label="Name"
            value={member.name}
          />

          <InfoRow
            label="Username"
            value={`@${member.username}`}
          />

          <InfoRow
            label="Role"
            value={member.role}
          />

          <InfoRow
            label="Status"
            value={
              member.isActive
                ? "Active"
                : "Inactive"
            }
          />

        </div>

        {!isLeader && (
          <div className="mt-8">

            <button
              onClick={handleToggleStatus}
              disabled={loading}
              className={`
    w-full py-2 rounded-md
    disabled:opacity-50
    disabled:cursor-not-allowed
    ${member.isActive
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-700"
                }
  `}
            >
              {loading
                ? "Processing..."
                : member.isActive
                  ? "Inactivate Member"
                  : "Activate Member"}
            </button>
          </div>
        )}

      </div>

    </Modal>
  )
}

interface InfoRowProps {
  label: string
  value: string
}

function InfoRow({
  label,
  value,
}: InfoRowProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="font-medium">
        {value}
      </p>
    </div>
  )
}