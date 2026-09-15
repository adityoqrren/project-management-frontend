"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Minus, Plus, RotateCcw, X } from "lucide-react";
import Lightbox, { ZoomRef } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import ImageViewer from "./ImageViewer";
import PdfViewer from "./PdfViewer";

interface AttachmentPreviewProps {
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileUrl: string;
  onClose: () => void;
}

export default function AttachmentPreview({
  fileName,
  originalFileName,
  mimeType,
  fileUrl,
  onClose,
}: AttachmentPreviewProps) {
  const isImage = mimeType.startsWith("image/");
  const isPdf =
    mimeType === "application/pdf";

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  if (isImage) {
    return (
      <ImageViewer
        fileName={fileName}
        originalFileName={originalFileName}
        fileUrl={fileUrl}
        onClose={onClose}
      />
    );
  }

  if (isPdf) {
    return (
      <PdfViewer
        fileName={fileName}
        originalFileName={originalFileName}
        fileUrl={fileUrl}
        onClose={onClose}
      />
    );
  }

  return null;
}
