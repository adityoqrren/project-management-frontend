"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { ProjectCreation } from "@/types/project";

interface ProjectFormDialogProps {

  title: string;
  submitLabel: string;

  loading?: boolean;

  loadingLabel: string;

  initialValues?: {
    name: string;
    description: string;
  };

  onClose: () => void;
  onSubmit: (project: ProjectCreation) => void;
}

type ProjectForm = {
  name: string;
  description: string;
};

export default function ProjectFormDialog({
  title,
  submitLabel,
  loading = false,
  loadingLabel,
  initialValues,
  onClose,
  onSubmit,
}: ProjectFormDialogProps) {
  const [form, setForm] = useState<ProjectForm>({
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  useEffect(() => {
    if (!open) return;
  }, [open, initialValues]);

  const handleChange = <K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "name" && errors.name) {
      setErrors((prev) => ({
        ...prev,
        name: "",
      }));
    }
  };

  const handleSubmit = () => {
    const newErrors = {
      name: "",
    };

    if (!form.name.trim()) {
      newErrors.name = "Project name is required";
    }

    setErrors(newErrors);

    if (newErrors.name) return;

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
    >
      <div className="p-6 w-[500px]">

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-4">

          {/* Name */}
          <div>

            <label className="text-sm text-gray-500">
              Project Name
            </label>

            <input
              value={form.name}
              placeholder="My First Project"
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              className={`
                w-full
                mt-1
                px-3
                py-2
                border
                rounded-md
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-400
                ${errors.name ? "border-red-500" : ""}
              `}
            />

            {errors.name && (
              <p className="mt-1 text-xs text-red-500">
                {errors.name}
              </p>
            )}

          </div>

          {/* Description */}
          <div>

            <label className="text-sm text-gray-500">
              Description
            </label>

            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                handleChange(
                  "description",
                  e.target.value
                )
              }
              className="
                w-full
                mt-1
                px-3
                py-2
                border
                rounded-md
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-400
              "
            />

          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">

          <button
            onClick={onClose}
            disabled={loading}
            className="
              px-3
              py-2
              text-gray-600
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              px-4
              py-2
              rounded-md
              bg-green-500
              text-white
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading ? loadingLabel : submitLabel}
          </button>

        </div>

      </div>
    </Modal>
  );
}