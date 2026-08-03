"use client";

import { ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import Modal from "./Modal";
import { VariantProps } from "class-variance-authority";

interface ConfirmDialogProps {
  open: boolean;

  title: string;
  description: ReactNode;

  confirmLabel?: string;
  loadingLabel?: string;

  confirmVariant?: VariantProps<typeof buttonVariants>["variant"];

  loading?: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,

  confirmLabel = "Confirm",
  loadingLabel = "Processing...",

  confirmVariant = "default",

  loading = false,

  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={open}
      onClose={onCancel}
    >
      <div className="w-[400px] p-6">

        <h2 className="mb-2 text-lg font-semibold">
          {title}
        </h2>

        <div className="mb-6 text-sm text-gray-500">
          {description}
        </div>

        <div className="flex justify-end gap-2">

          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? loadingLabel
              : confirmLabel}
          </Button>

        </div>

      </div>
    </Modal>
  );
}