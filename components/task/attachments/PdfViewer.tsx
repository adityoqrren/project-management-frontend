import { ToastType, useToast } from "@/context/ToastContext";
import { downloadAttachment } from "@/lib/downloadAttachment";
import { Download, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  onClose: () => void;
}

export default function PdfViewer({
  fileName,
  originalFileName,
  fileUrl,
  onClose,
}: PdfViewerProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] =
    useState(0);

  const [numPages, setNumPages] =
    useState(0);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const updateWidth = () => {
      setContainerWidth(
        container.clientWidth
      );
    };

    updateWidth();

    const observer =
      new ResizeObserver(updateWidth);

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

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

  const handleZoomOut = () => {
    setScale((current) =>
      Math.max(0.5, current - 0.25)
    );
  };

  const handleZoomIn = () => {
    setScale((current) =>
      Math.min(2.5, current + 0.25)
    );
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const baseWidth =
    containerWidth > 0
      ? Math.min(containerWidth - 32, 1000)
      : undefined;

  const pageWidth =
    baseWidth !== undefined
      ? baseWidth * scale
      : undefined;

  console.log(`fileName: ${fileName} | fileUrl ${fileUrl}`);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <header
        className="
          absolute
          left-0
          right-0
          top-0
          z-20
          flex
          items-center
          justify-between
          bg-linear-to-b
          from-black/90
          to-transparent
          px-4
          pb-8
          pt-4
        "
      >
        <p className="max-w-[60%] truncate text-sm font-medium text-white">
          {fileName}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="
              flex
              size-9
              items-center
              justify-center
              rounded-full
              bg-black/60
              text-white
              transition
              hover:bg-white/20
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            aria-label="Zoom out"
          >
            −
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="
              min-w-14
              rounded-full
              bg-black/60
              px-3
              py-2
              text-xs
              text-white
              transition
              hover:bg-white/20
            "
            aria-label="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 2.5}
            className="
              flex
              size-9
              items-center
              justify-center
              rounded-full
              bg-black/60
              text-white
              transition
              hover:bg-white/20
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            aria-label="Zoom in"
          >
            +
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="
              flex
              size-9
              items-center
              justify-center
              rounded-full
              bg-black/60
              text-white
              transition
              hover:bg-white/20
            "
            aria-label="Download attachment"
          >
            <Download className="size-5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              size-9
              items-center
              justify-center
              rounded-full
              bg-black/60
              text-white
              transition
              hover:bg-white/20
            "
            aria-label="Close preview"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {/* PDF viewer */}
      <div
        ref={containerRef}
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          pt-16
        "
      >
        <div className="flex flex-col items-center gap-4 px-4 pb-8">
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) =>
              setNumPages(numPages)
            }
            loading={
              <div className="py-16 text-sm text-white">
                Loading PDF...
              </div>
            }
            error={
              <div className="py-16 text-sm text-red-400">
                Failed to load PDF.
              </div>
            }
          >
            {Array.from(
              { length: numPages },
              (_, index) => (
                <Page
                  key={index + 1}
                  pageNumber={index + 1}
                  width={pageWidth}
                  className="mb-4 shadow-xl"
                  renderTextLayer
                  renderAnnotationLayer
                />
              )
            )}
          </Document>
        </div>
      </div>
    </div>
  );
}