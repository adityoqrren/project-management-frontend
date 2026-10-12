import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Trash2,
  Eye,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";
import { downloadAttachment } from "@/lib/downloadAttachment";
import { ToastType, useToast } from "@/context/ToastContext";

interface AttachmentActionsProps {
  originalFileName: string;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  onPreview: () => void;
  onOpen: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export default function AttachmentActions({
  originalFileName,
  fileName,
  mimeType,
  fileUrl,
  onPreview,
  onOpen,
  onDelete,
  disabled = false,
}: AttachmentActionsProps) {
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);

  const buttonRef =
    useRef<HTMLButtonElement>(null);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const [menuPosition, setMenuPosition] =
    useState({
      top: 0,
      left: 0,
    });

  const [downloading, setDownloading] =
    useState(false);

  const isPreviewable =
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf";

  useEffect(() => {
    if (!open || !buttonRef.current) {
      return;
    }

    const updateMenuPosition = () => {
      if (!buttonRef.current) {
        return;
      }

      const rect =
        buttonRef.current.getBoundingClientRect();

      const menuWidth = 144;
      const menuHeight =
        isPreviewable ? 72 : 72;

      const gap = 4;

      let left =
        rect.right - menuWidth;

      let top =
        rect.bottom + gap;

      if (
        left <
        8
      ) {
        left = 8;
      }

      if (
        left + menuWidth >
        window.innerWidth - 8
      ) {
        left =
          window.innerWidth -
          menuWidth -
          8;
      }

      if (
        top + menuHeight >
        window.innerHeight - 8
      ) {
        top =
          rect.top -
          menuHeight -
          gap;
      }

      setMenuPosition({
        top,
        left,
      });
    };

    updateMenuPosition();

    const handleScroll = () => {
      updateMenuPosition();
    };

    const handleResize = () => {
      updateMenuPosition();
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [open, isPreviewable]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
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
  }, [open]);

  const handlePreview = () => {
    setOpen(false);
    onPreview();
  };

  const handleOpen = () => {
    setOpen(false);
    onOpen();
  };

  const handleDownload = async () => {
    ;
    setDownloading(true);

    try {
      await downloadAttachment(
        fileUrl,
        originalFileName
      );

      setOpen(false);
    } catch (error) {
      console.error(error);
      showToast(
        "Failed to download attachment.",
        ToastType.error
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete();
  };

  const menu = open ? (
    <div
      ref={menuRef}
      className="
        fixed
        z-50
        w-36
        rounded-md
        border
        bg-white
        py-1
        shadow-md
      "
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
      }}
    >
      {isPreviewable ? (
        <button
          type="button"
          onClick={handlePreview}
          className="
            flex
            w-full
            items-center
            gap-2
            px-3
            py-2
            text-left
            text-sm
            text-gray-700
            hover:bg-gray-200
          "
        >
          <Eye className="size-3.5" />
          Preview
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="
            flex
            w-full
            items-center
            gap-2
            px-3
            py-2
            text-left
            text-sm
            text-gray-700
            hover:bg-gray-50
          "
        >
          <ExternalLink className="size-3.5" />
          Open
        </button>
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="
            flex
            w-full
            items-center
            gap-2
            px-3
            py-2
            text-left
            text-sm
            text-gray-700
            hover:bg-gray-200
          "
      >
        {downloading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Download className="size-3.5" />
        )}

        {downloading
          ? "Downloading..."
          : "Download"}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        className="
          flex
          w-full
          items-center
          gap-2
          px-3
          py-2
          text-left
          text-sm
          text-red-600
          hover:bg-gray-200
        "
      >
        <Trash2 className="size-3.5" />
        Delete
      </button>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        disabled={disabled}
        className="
          flex
          size-7
          items-center
          justify-center
          rounded-md
          text-gray-400
          hover:bg-gray-100
          hover:text-gray-900
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
        aria-label={`Actions for ${fileName}`}
        aria-expanded={open}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          menu,
          document.body
        )}
    </>
  );
}