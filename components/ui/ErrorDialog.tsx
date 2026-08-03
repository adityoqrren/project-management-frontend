"use client";

interface ErrorDialogProps {
  message: string;
  onClose: () => void;
}

export default function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      {/* Modal container */}
      <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
        {/* Title */}
        <h2 className="text-lg font-semibold mb-2">Error</h2>

        {/* Error message */}
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-black text-white py-2 rounded-lg text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}