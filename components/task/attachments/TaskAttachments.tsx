"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus } from "lucide-react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteTaskAttachment,
  getTaskAttachments,
  uploadTaskFile,
  uploadTaskImage,
} from "@/lib/taskattachments";
import {
  TaskAttachment,
  TaskAttachmentType,
} from "@/types/taskattachment";
import { ToastType, useToast } from "@/context/ToastContext";
import { AttachmentRow } from "./AttachmentRow";
import AttachmentPreview from "./AttachmentPreview";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type AttachmentFilter = "all" | "images" | "docs";

type AttachmentSortBy = "date" | "name";

type AttachmentSortOrder = "asc" | "desc";

interface TaskAttachmentsProps {
  taskId: string;
  canManageAttachment: boolean;
}

const FILTER_TYPE_MAP: Record<
  AttachmentFilter,
  TaskAttachmentType
> = {
  all: "all",
  images: "image",
  docs: "file",
};

const IMAGE_ACCEPT =
  ".jpg,.jpeg,.png,.webp";

const FILE_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const FILE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
];

export default function TaskAttachments({
  taskId,
  canManageAttachment
}: TaskAttachmentsProps) {
  const [filter, setFilter] =
    useState<AttachmentFilter>("all");

  const [sortBy, setSortBy] =
    useState<AttachmentSortBy>("date");

  const [sortOrder, setSortOrder] =
    useState<AttachmentSortOrder>("desc");

  const [uploadMenuOpen, setUploadMenuOpen] =
    useState(false);

  const [uploadType, setUploadType] =
    useState<"image" | "file" | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const uploadMenuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!uploadMenuOpen) {
      return;
    }

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        uploadMenuRef.current &&
        !uploadMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setUploadMenuOpen(false);
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setUploadMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [uploadMenuOpen]);

  const queryClient = useQueryClient();

  const { showToast } = useToast();

  const attachmentType =
    FILTER_TYPE_MAP[filter];

  const [previewAttachment, setPreviewAttachment] =
    useState<TaskAttachment | null>(null);

  const [deleteAttachment, setDeleteAttachment] =
    useState<TaskAttachment | null>(null);

  const {
    data,
    isLoading,
    // isFetching,
    isError,
  } = useQuery({
    queryKey: [
      "task-attachments",
      taskId,
      attachmentType,
    ],
    queryFn: () =>
      getTaskAttachments(
        taskId,
        attachmentType
      ),
    enabled: !!taskId,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({
      type,
      file,
    }: {
      type: "image" | "file";
      file: File;
    }) => {
      if (type === "image") {
        return uploadTaskImage(
          taskId,
          file.name,
          file
        );
      }

      return uploadTaskFile(
        taskId,
        file.name,
        file
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["task-attachments", taskId],
      });

      showToast(
        "Attachment uploaded successfully"
      );
    },

    onError: (error) => {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to upload attachment.",
        ToastType.error
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      deleteTaskAttachment(
        taskId,
        attachmentId
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["task-attachments", taskId],
      });

      setDeleteAttachment(null);

      showToast(
        "Attachment deleted successfully"
      );
    },

    onError: (error) => {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to delete attachment.",
        ToastType.error
      );
    },
  });

  const attachments = data?.data ?? [];

  const handleSelectAttachmentType = (
    type: "image" | "file"
  ) => {
    setUploadType(type);

    requestAnimationFrame(() => {
      fileInputRef.current?.click();
    });
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !uploadType) {
      return;
    }

    const isImage =
      uploadType === "image";

    const allowedMimeTypes = isImage
      ? IMAGE_MIME_TYPES
      : FILE_MIME_TYPES;

    const maxSize = isImage
      ? MAX_IMAGE_SIZE
      : MAX_FILE_SIZE;

    if (!allowedMimeTypes.includes(file.type)) {
      showToast(
        isImage
          ? "Only JPEG, PNG, and WEBP images are allowed."
          : "Only PDF, DOC, DOCX, XLS, XLSX, CSV, and TXT files are allowed.",
        ToastType.error
      );

      setUploadType(null);
      return;
    }

    if (file.size > maxSize) {
      showToast(
        isImage
          ? "Image size must not exceed 2 MB."
          : "File size must not exceed 10 MB.",
        ToastType.error
      );

      setUploadType(null);
      return;
    }

    uploadMutation.mutate({
      type: uploadType,
      file,
    });

    setUploadType(null);
  };

  const handleDelete = (
    attachment: TaskAttachment
  ) => {
    setDeleteAttachment(attachment);
  };

  const handleConfirmDelete = () => {
    if (!deleteAttachment) {
      return;
    }

    deleteMutation.mutate(
      deleteAttachment.id,
    );
  };

  const sortedAttachments = useMemo(() => {
    return [...attachments].sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(
          a.createdAt
        ).getTime();

        const dateB = new Date(
          b.createdAt
        ).getTime();

        return sortOrder === "desc"
          ? dateB - dateA
          : dateA - dateB;
      }

      const nameA = a.originalFileName.toLowerCase();
      const nameB = b.originalFileName.toLowerCase();

      const comparison =
        nameA.localeCompare(nameB);

      return sortOrder === "desc"
        ? -comparison
        : comparison;
    });
  }, [attachments, sortBy, sortOrder]);

  const handleSort = (
    nextSortBy: AttachmentSortBy
  ) => {
    if (sortBy === nextSortBy) {
      setSortOrder((current) =>
        current === "asc"
          ? "desc"
          : "asc"
      );
      return;
    }

    setSortBy(nextSortBy);
    setSortOrder(
      nextSortBy === "date"
        ? "desc"
        : "asc"
    );
  };

  const renderSortIcon = (
    column: AttachmentSortBy
  ) => {
    if (sortBy !== column) {
      return null;
    }

    return sortOrder === "asc" ? (
      <ArrowUp className="size-3.5" />
    ) : (
      <ArrowDown className="size-3.5" />
    );
  };

  return (
    <section className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Attachments ({attachments.length})
        </h2>

        {canManageAttachment && (
          <div className="flex items-center gap-2">
            {uploadMutation.isPending && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}

            <div
              ref={uploadMenuRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setUploadMenuOpen((open) => !open)
                }
                disabled={uploadMutation.isPending}
                className="
            flex
            size-7
            items-center
            justify-center
            rounded-md
            text-gray-500
            hover:bg-gray-100
            hover:text-gray-900
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
                aria-label="Add attachment"
              >
                <Plus className="size-4" />
              </button>

              {uploadMenuOpen && (
                <div
                  className="
              absolute
              right-0
              top-full
              z-20
              mt-1
              w-36
              rounded-md
              border
              bg-white
              py-1
              shadow-sm
            "
                >
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMenuOpen(false);
                      handleSelectAttachmentType("image");
                    }}
                    className="
                w-full
                px-3
                py-2
                text-left
                text-sm
                text-gray-500
                hover:bg-gray-100
                hover:text-gray-900
              "
                  >
                    Image
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadMenuOpen(false);
                      handleSelectAttachmentType("file");
                    }}
                    className="
                w-full
                px-3
                py-2
                text-left
                text-sm
                text-gray-500
                hover:bg-gray-100
                hover:text-gray-900
              "
                  >
                    File
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/** Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={
          uploadType === "image"
            ? IMAGE_ACCEPT
            : FILE_ACCEPT
        }
        onChange={handleFileChange}
      />

      {/* Filters */}
      <div className="flex items-center gap-1">
        {(
          [
            ["all", "All"],
            ["images", "Images"],
            ["docs", "Docs"],
          ] as const
        ).map(([value, label]) => {
          const active =
            filter === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() =>
                setFilter(value)
              }
              className={`
                rounded-md
                px-3
                py-1.5
                text-sm
                transition
                ${active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
                }
              `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading attachments...
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="py-8 text-center text-sm text-red-500">
          Failed to load attachments.
        </div>
      )}

      {/* Table */}
      {!isLoading &&
        !isError &&
        attachments.length > 0 && (
          <div className="max-h-100 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b text-left text-xs text-gray-500">
                  <th className="px-3 py-2 font-medium">
                    <button
                      type="button"
                      onClick={() =>
                        handleSort("name")
                      }
                      className="
                        flex
                        items-center
                        gap-1
                        hover:text-gray-900
                      "
                    >
                      Name
                      {renderSortIcon("name")}
                    </button>
                  </th>

                  <th className="whitespace-nowrap px-3 py-2 font-medium">
                    <button
                      type="button"
                      onClick={() =>
                        handleSort("date")
                      }
                      className="
                        flex
                        items-center
                        gap-1
                        hover:text-gray-900
                      "
                    >
                      Date added
                      {renderSortIcon("date")}
                    </button>
                  </th>

                  <th className="whitespace-nowrap px-3 py-2 font-medium">
                    Size
                  </th>

                  <th className="whitespace-nowrap px-3 py-2 font-medium">
                    Added by
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedAttachments.map(
                  (attachment) => (
                    <AttachmentRow
                      key={attachment.id}
                      attachment={attachment}
                      canManageAttachment={
                        canManageAttachment
                      }
                      onDelete={handleDelete}
                      onPreview={setPreviewAttachment}
                      isDeleting={
                        deleteMutation.isPending &&
                        deleteMutation.variables ===
                        attachment.id
                      }
                    />
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

      {/* Empty */}
      {!isLoading &&
        !isError &&
        attachments.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">
           {filter == "images" ? `No images attached.` : (filter == "docs" ) ? `No documents attached.` : `No attachments.` }
          </div>
        )}

      {/* Background refetch indicator */}
      {/* {isFetching && !isLoading && (
        <div className="text-xs text-gray-400">
          Updating attachments...
        </div>
      )} */}

      {previewAttachment && (
        <AttachmentPreview
          fileName={previewAttachment.fileName}
          originalFileName={
            previewAttachment.originalFileName
          }
          mimeType={
            previewAttachment.mimeType
          }
          fileUrl={previewAttachment.fileUrl}
          onClose={() =>
            setPreviewAttachment(null)
          }
        />
      )}

      <ConfirmDialog
        open={!!deleteAttachment}
        title="Delete attachment?"
        description={
          deleteAttachment
            ? `Are you sure you want to delete "${deleteAttachment.fileName}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        confirmVariant="destructive"
        loading={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setDeleteAttachment(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </section>

  );
}