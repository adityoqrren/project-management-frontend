
"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

interface PhotoProfileDialogProps {
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
}

const MAX_ORIGINAL_SIZE = 10 * 1024 * 1024;
const MAX_OUTPUT_SIZE = 2 * 1024 * 1024;
const OUTPUT_SIZE = 512;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function PhotoProfileDialog({
  onClose,
  onSave,
}: PhotoProfileDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  // Release temporary image URLs when the source changes or the dialog unmounts.
  useEffect(() => {
    if (!imageSrc) return;

    return () => URL.revokeObjectURL(imageSrc);
  }, [imageSrc]);

  function handleClose() {
    if (processing) return;
    onClose();
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    setError(null);
    setPrepared(false);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_ORIGINAL_SIZE) {
      setError("The original image must be 10 MB or smaller.");
      return;
    }

    setImageSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropArea(null);
  }

  async function handlePreparePhoto() {
    if (!imageSrc || !cropArea || processing) return;

    setProcessing(true);
    setError(null);
    setPrepared(false);
    setCroppedFile(null);

    try {
      const file = await createCroppedPhoto(imageSrc, cropArea);

      setCroppedFile(file);
      setPrepared(true);
    } catch {
      setError("Could not process this image. Please try another one.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleSavePhoto() {
    if (!croppedFile || processing) return;

    setProcessing(true);
    setError(null);

    try {
      await onSave(croppedFile);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload your profile photo."
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-profile-title"
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="photo-profile-title" className="text-lg font-semibold">
          {imageSrc ? "Adjust profile photo" : "Add profile photo"}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Choose an image, then crop it into a square.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {!imageSrc ? (
          <div className="mt-5 flex flex-col items-center gap-4 rounded-lg
            border border-dashed p-8 text-center">
            <p className="text-sm text-gray-600">
              JPEG, PNG, or WebP. Maximum original size: 10 MB.
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md border px-4 py-2 text-sm font-medium
                hover:bg-gray-50"
            >
              Choose image
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="relative mx-auto aspect-square w-full max-w-sm
              overflow-hidden rounded-lg bg-gray-100">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) => {
                  setCropArea(croppedAreaPixels);
                  setPrepared(false);
                }}
              />
            </div>

            <div>
              <label
                htmlFor="photo-zoom"
                className="mb-2 block text-sm font-medium"
              >
                Zoom
              </label>

              <input
                id="photo-zoom"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => {
                  setZoom(Number(event.target.value));
                  setPrepared(false);
                }}
                className="w-full"
              />
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm font-medium underline underline-offset-4"
            >
              Choose a different image
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {prepared && (
          <p role="status" className="mt-4 text-sm text-green-700">
            Image prepared successfully. Upload integration will be added later.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={processing}
            className="rounded-md border px-4 py-2 text-sm
              hover:bg-gray-50 disabled:opacity-50"
          >
            Close
          </button>

          {!prepared && (
            <button
              type="button"
              onClick={handlePreparePhoto}
              disabled={!imageSrc || !cropArea || processing}
              className="rounded-md bg-black px-4 py-2 text-sm
              font-medium text-white hover:bg-gray-800
              disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Processing..." : "Prepare photo"}
            </button>
          )}

          {prepared && croppedFile && (
            <button
              type="button"
              onClick={handleSavePhoto}
              disabled={!imageSrc || !cropArea || processing}
              className="rounded-md bg-black px-4 py-2 text-sm
              font-medium text-white hover:bg-gray-800
              disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Uploading..." : "Save photo"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

async function createCroppedPhoto(
  imageSrc: string,
  cropArea: Area,
): Promise<File> {
  const image = new Image();
  image.src = imageSrc;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported.");
  }

  context.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  // JPEG avoids large output files when the original is a PNG.
  // Reduce quality if necessary to stay below the API's 2 MB limit.
  for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4]) {
    const blob = await canvasToBlob(canvas, quality);

    if (blob.size <= MAX_OUTPUT_SIZE) {
      return new File([blob], "photo-profile.jpg", {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    }
  }

  throw new Error("The processed image exceeds 2 MB.");
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not encode the image."));
        }
      },
      "image/jpeg",
      quality,
    );
  });
}
