"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { TaskComment } from "@/lib/taskcomment";
import { formatDateTimeStringLocal } from "@/utils/formatter";

interface CommentItemProps {
  comment: TaskComment;
  currentUserId?: string;
  canManageTask: boolean;
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export default function CommentItem({
  comment,
  currentUserId,
  canManageTask,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);

  const isOwner = comment.user.id === currentUserId;

  const handleCancelEdit = () => {
    setContent(comment.content);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    const trimmedContent = content.trim();

    if (!trimmedContent || trimmedContent === comment.content) {
      return;
    }

    onUpdate(comment.id, trimmedContent);
    setIsEditing(false);
  };

  return (
    <div className="border-b pb-5 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {comment.user.name}
          </p>

          <p className="mt-0.5 text-xs text-gray-400">
            {formatDateTimeStringLocal(comment.createdAt)}
            {comment.updatedAt !== comment.createdAt && " · edited"}
          </p>
        </div>

        {(isOwner || canManageTask) && !isEditing && (
          <div className="flex shrink-0 items-center gap-1">
            {/** only owner comment can edit */}
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isUpdating || isDeleting}
                className="
                  rounded-md
                  p-1.5
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                title="Edit comment"
              >
                <Pencil className="size-4" />
              </button>
            )}
            {/** only owner who can manage task and comment owner can delete */}
            {(canManageTask || isOwner) && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                disabled={isUpdating || isDeleting}
                className="
                  rounded-md
                  p-1.5
                  text-gray-400
                  hover:bg-red-50
                  hover:text-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                title="Delete comment"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={3}
            className="
              w-full
              resize-none
              rounded-md
              border
              px-3
              py-2
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
            "
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="
                rounded-md
                px-3
                py-1.5
                text-sm
                text-gray-600
                hover:bg-gray-100
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={!content.trim() || isUpdating}
              className="
                rounded-md
                bg-black
                px-3
                py-1.5
                text-sm
                text-white
                hover:bg-gray-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {comment.content}
        </p>
      )}
    </div>
  );
}