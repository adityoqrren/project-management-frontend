import { ToastType, useToast } from "@/context/ToastContext";
import { downloadAttachment } from "@/lib/downloadAttachment";
import { RotateCcw, Download, X } from "lucide-react";
import { useRef } from "react";
import Lightbox, { ZoomRef } from "yet-another-react-lightbox";
import { Zoom } from "yet-another-react-lightbox/plugins";

interface ImageViewerProps {
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  onClose: () => void;
}

export default function ImageViewer({
  fileName,
  originalFileName,
  fileUrl,
  onClose,
}: ImageViewerProps) {
  const zoomRef = useRef<ZoomRef>(null);

  const { showToast } = useToast();

  const handleDownload = async () => {
    try {
      await downloadAttachment(
        fileUrl,
        originalFileName
      );
    } catch (error) {
      console.error(error);
      showToast(
        "Failed to download attachment.",
        ToastType.error
      );
    }
  };

  // const handleZoomOut = () => {
  //   zoomRef.current?.zoomOut();
  // };

  // const handleZoomIn = () => {
  //   zoomRef.current?.zoomIn();
  // };

  const handleResetZoom = () => {
    zoomRef.current?.changeZoom(1);
  };

  return (
    <Lightbox
      open
      close={onClose}
      slides={[
        {
          src: fileUrl,
          alt: fileName,
        },
      ]}
      plugins={[Zoom]}
      zoom={{
        ref: zoomRef,
        minZoom: 1,
        maxZoomPixelRatio: 2,
        zoomInMultiplier: 1.5,
      }}
      toolbar={{
        buttons: [
          <div
            key="attachment-toolbar"
            className="
              flex
              items-center
              gap-1
            "
          >
            <button
              type="button"
              onClick={handleResetZoom}
              className="yarl__button"
              aria-label="Reset zoom"
            >
              <RotateCcw className="size-4" />
            </button>

            <span
              className="
                mr-3
                max-w-[40vw]
                truncate
                text-sm
                font-medium
                text-white
              "
              title={fileName}
            >
              {fileName}
            </span>

            <button
              type="button"
              onClick={handleDownload}
              className="yarl__button"
              aria-label="Download attachment"
            >
              <Download className="size-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="yarl__button"
              aria-label="Close preview"
            >
              <X className="size-5" />
            </button>
          </div>,
        ],
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
    />
  );
}