
"use client";

import { useState, type FormEvent } from "react";

interface EditFullNameDialogProps {
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function EditFullNameDialog({
  currentName,
  onClose,
  onSave,
}: EditFullNameDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }

    if (trimmedName === currentName.trim()) {
      setError("Enter a different name.");
      return;
    }

    setError(null);
    onSave(trimmedName);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-name-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="edit-name-title" className="text-lg font-semibold">
          Edit full name
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Update the name displayed on your profile.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="full-name"
              className="mb-1.5 block text-sm font-medium"
            >
              Full name
            </label>

            <input
              id="full-name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError(null);
              }}
              autoFocus
              maxLength={100}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "full-name-error" : undefined}
              className="w-full rounded-md border px-3 py-2 text-sm
                outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && (
              <p
                id="full-name-error"
                role="alert"
                className="mt-1.5 text-sm text-red-600"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm
                hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                name.trim().length < 3 ||
                name.trim() === currentName.trim()
              }
              className="rounded-md bg-black px-4 py-2 text-sm
                font-medium text-white hover:bg-gray-800
                disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
