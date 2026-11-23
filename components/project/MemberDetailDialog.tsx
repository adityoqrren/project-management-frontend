"use client"

import Modal from "@/components/ui/Modal"
import { ApiError } from "@/lib/errors"
import { getMemberTaskSummary, updateMemberActiveStatus } from "@/lib/project"
import { Member } from "@/types/project"
import { useState } from "react"
import { ToastType, useToast } from "@/context/ToastContext"
import { useQuery } from "@tanstack/react-query"

interface Props {
  projectId: string
  member: Member
  canManageProject: boolean
  onClose: () => void
  onStatusChanged: () => Promise<void>
}

export default function MemberDetailDialog({
  projectId,
  member,
  canManageProject,
  onClose,
  onStatusChanged
}: Props) {
  const isLeader =
    member.role === "LEADER"

  const [loading, setLoading] = useState(false)


  const [showInactivateConfirm, setShowInactivateConfirm] =
    useState(false);


  const { showToast } = useToast()


  const {
    data: taskSummaryData,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchTaskSummary,
  } = useQuery({
    queryKey: [
      "memberTaskSummary",
      projectId,
      member.memberId,
    ],
    queryFn: () =>
      getMemberTaskSummary(projectId, member.memberId),
    enabled: showInactivateConfirm && member.isActive,
    retry: false,
  });

  const taskSummary = taskSummaryData?.data;

  const handleToggleStatus = async () => {
    try {
      setLoading(true)

      const newStatus = !member.isActive

      await updateMemberActiveStatus(
        projectId,
        member.memberId,
        newStatus
      )

      await onStatusChanged()

      onClose()

      showToast(
        newStatus
          ? "Member activated successfully"
          : "Member inactivated successfully"
      )

    } catch (error) {
      //console.error(error)

      if (error instanceof ApiError) {
        showToast(error.message, ToastType.error)
      } else {
        showToast(
          "Failed to update member status",
          ToastType.error
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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

          {(!isLeader && canManageProject) && (
            <div className="mt-8">

              {member.isActive ? (
                <button
                  onClick={() => setShowInactivateConfirm(true)}
                  className={`
                  w-full py-2 rounded-md
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  bg-red-100 text-red-600
                `}
                >
                  Inactivate Member
                </button>
              ) : (
                <button
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className={`
                  w-full py-2 rounded-md
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  bg-green-100 text-green-700
                `}
                >
                  {loading ? "Processing..." : "Activate Member"}
                </button>
              )}
            </div>
          )}

        </div>

      </Modal>


      {showInactivateConfirm && (
        <Modal
          isOpen
          onClose={() => setShowInactivateConfirm(false)}
        >
          <div className="w-[500px] max-w-[calc(100vw-2rem)] p-6">
            <h2 className="text-lg font-semibold">
              Inactivate Member ({member.name})
            </h2>

            {summaryLoading ? (
              <p className="mt-4 text-sm text-gray-500">
                Loading task summary...
              </p>
            ) : summaryError ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-red-600">
                  Failed to load task summary. Please try again.
                </p>

                <button
                  type="button"
                  onClick={() => refetchTaskSummary()}
                  className="text-sm font-medium text-blue-600"
                >
                  Retry
                </button>
              </div>
            ) : taskSummary ? (
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <p>
                  This member currently has{" "}
                  <strong>
                    {taskSummary.unfinishedTasks.total}{" "}
                    {taskSummary.unfinishedTasks.total === 1
                      ? "unfinished task"
                      : "unfinished tasks"}
                  </strong>{" "}
                  and{" "}
                  <strong>
                    {taskSummary.completedTasks.total}{" "}
                    {taskSummary.completedTasks.total === 1
                      ? "completed task"
                      : "completed tasks"}
                  </strong>
                  , including archived tasks.
                </p>

                <p>
                  If you inactivate this member, all unfinished tasks
                  (TODO and IN_PROGRESS) assigned to them will be
                  unassigned. Completed tasks (DONE) will retain their
                  current assignments as historical records.
                </p>

                <p>
                  Are you sure you want to inactivate this member?
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowInactivateConfirm(false)}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={
                  loading ||
                  summaryLoading ||
                  summaryError ||
                  !taskSummary
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing..." : "Inactivate Member"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
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