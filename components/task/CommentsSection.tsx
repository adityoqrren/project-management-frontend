"use client";

import { useState } from "react";
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  createTaskComment,
  deleteTaskComment,
  getTaskComments,
  GetTaskCommentsApiResponse,
  updateTaskComment,
} from "@/lib/taskcomment";
import CommentItem from "./CommentItem";
import ConfirmDialog from "../ui/ConfirmDialog";

interface CommentsSectionProps {
  taskId: string;
  canManageTask: boolean;
}

const COMMENT_LIMIT = 3;

export default function CommentsSection({
  taskId,
  canManageTask,
}: CommentsSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");

  const [deleteCommentId, setDeleteCommentId] =
    useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["taskComments", taskId],

    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      getTaskComments(taskId, {
        cursor: pageParam,
        limit: COMMENT_LIMIT,
      }),

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.nextCursor ?? undefined,

    enabled: !!taskId,
  });

  const createMutation = useMutation({
    mutationFn: (commentContent: string) =>
      createTaskComment(taskId, commentContent),

    onSuccess: (response) => {
      const newComment = response.data;

      // (optimistic update) auto add newest comment to the top without refetch and pagination changes
      queryClient.setQueryData<InfiniteData<GetTaskCommentsApiResponse>>(
        ["taskComments", taskId],
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page, index) => {
              if (index !== 0) {
                return page;
              }

              return {
                ...page,
                data: [
                  newComment,
                  ...page.data,
                ],
                pagination: {
                  ...page.pagination,
                  total: page.pagination.total + 1,
                },
              };
            }),
          };
        }
      );

      setContent("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) =>
      updateTaskComment(
        taskId,
        commentId,
        content
      ),

    onSuccess: (response) => {
      const updatedComment = response.data;

      queryClient.setQueryData<InfiniteData<GetTaskCommentsApiResponse>>(
        ["taskComments", taskId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((comment) =>
                comment.id === updatedComment.id
                  ? updatedComment
                  : comment
              ),
            })),
          };
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) =>
      deleteTaskComment(taskId, commentId),

    onSuccess: () => {
      setDeleteCommentId(null);

      queryClient.setQueryData<InfiniteData<GetTaskCommentsApiResponse>>(
        ["taskComments", taskId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.filter(
                (comment) => comment.id !== deleteCommentId
              ),
            })),
          };
        }
      );
    },
  });

  const comments =
    data?.pages.flatMap((page) => page.data) ?? [];
  const totalComments =
    data?.pages[0]?.pagination.total ?? 0;

  const handleSubmit = () => {
    const trimmedContent = content.trim();

    if (!trimmedContent || createMutation.isPending) {
      return;
    }

    createMutation.mutate(trimmedContent);
  };

  const handleUpdate = (
    commentId: string,
    newContent: string
  ) => {
    updateMutation.mutate({
      commentId,
      content: newContent,
    });
  };

  const handleDelete = (commentId: string) => {
    setDeleteCommentId(commentId);
  };

  const confirmDelete = () => {
    if (!deleteCommentId) {
      return;
    }

    deleteMutation.mutate(deleteCommentId);
  };

  return (
    <>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">
            Comments
          </h2>

          {totalComments > 0 && (
            <span className="text-xs text-gray-400">
              {totalComments}{" "}
              {totalComments === 1 ? "comment" : "comments"}
            </span>
          )}
        </div>

        {/* Write comment */}
        <div className="mt-6 mx-1">
          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            rows={3}
            placeholder="Write a comment..."
            disabled={createMutation.isPending}
            className="
              w-full
              resize-none
              rounded-md
              border
              px-3
              py-2
              text-sm
              placeholder:text-gray-400
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
              disabled:bg-gray-100
            "
          />

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !content.trim() ||
                createMutation.isPending
              }
              className="
                rounded-md
                bg-black
                px-4
                py-2
                text-sm
                text-white
                hover:bg-gray-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {createMutation.isPending
                ? "Commenting..."
                : "Comment"}
            </button>
          </div>
        </div>

        <div className="mt-3 border-t">
          {/* Loading */}
          {isLoading && (
            <div className="space-y-5 py-5">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse space-y-3"
                >
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="py-6 text-sm text-red-500">
              Failed to load comments.
            </div>
          )}

          {/* Empty */}
          {!isLoading &&
            !isError &&
            comments.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">
                  No comments yet.
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Be the first to leave a comment.
                </p>
              </div>
            )}

          {/* Comments */}
          {!isLoading &&
            !isError &&
            comments.length > 0 && (
              <div className="divide-y">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="py-5 first:pt-5"
                  >
                    <CommentItem
                      comment={comment}
                      currentUserId={user?.id}
                      canManageTask={canManageTask}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      isUpdating={updateMutation.isPending}
                      isDeleting={
                        deleteMutation.isPending &&
                        deleteCommentId === comment.id
                      }
                    />
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Pagination */}

        {hasNextPage && (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="
      mt-5
      w-full
      rounded-md
      border
      px-4
      py-2
      text-sm
      text-gray-600
      hover:bg-gray-50
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
          >
            {isFetchingNextPage
              ? "Loading..."
              : "Load more"}
          </button>
        )}

      </section>

      <ConfirmDialog
        open={!!deleteCommentId}
        title="Delete comment"
        description="Are you sure you want to delete this comment?"
        onCancel={() => setDeleteCommentId(null)}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}