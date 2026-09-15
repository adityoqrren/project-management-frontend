import { TaskAttachment } from "@/types/taskattachment";
import AttachmentActions from "./AttachmentActions";

interface AttachmentRowProps {
  attachment: TaskAttachment;
  canManageAttachment: boolean;
  onDelete: (
    attachment: TaskAttachment
  ) => void;
  onPreview: (
    attachment: TaskAttachment
  ) => void;
  isDeleting: boolean;
}

export function AttachmentRow({
  attachment,
  canManageAttachment,
  onDelete,
  onPreview,
  isDeleting,
}: AttachmentRowProps) {
  const date = new Date(
    attachment.createdAt
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const sizeInKB = attachment.size / 1024;

  const size =
    sizeInKB < 1024
      ? `${sizeInKB.toFixed(1)} KB`
      : `${(sizeInKB / 1024).toFixed(1)} MB`;

  const isPreviewable =
    attachment.mimeType.startsWith("image/") ||
    attachment.mimeType === "application/pdf";

  const handleOpenAttachment = () => {
    window.open(
      attachment.fileUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <tr className="border-b last:border-b-0">
      <td className="px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0">
            {attachment.mimeType.startsWith(
              "image/"
            )
              ? "🖼"
              : "📄"}
          </span>

          <span className="truncate text-gray-900">
            <button
              type="button"
              onClick={() => {
                if (isPreviewable) {
                  onPreview(attachment);
                  return;
                }

                handleOpenAttachment();
              }}
              className="
                min-w-0
                truncate
                text-left
                text-gray-900
                hover:underline
              "
            >
              {attachment.fileName}
            </button>
          </span>
        </div>
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-gray-500">
        {date}
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-gray-500">
        {size}
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-gray-500">
        {attachment.user.name}
      </td>

      {canManageAttachment && (
        <td>
          <AttachmentActions
            originalFileName={attachment.originalFileName}
            fileName={attachment.fileName}
            mimeType={attachment.mimeType}
            fileUrl={attachment.fileUrl}
            onDelete={() => onDelete(attachment)}
            onPreview={() => onPreview(attachment)}
            onOpen={handleOpenAttachment}
            disabled={isDeleting}
          />
        </td>
      )}
    </tr>
  );
}