"use client"

import { createContext, useContext, useState } from "react"

type ToastType = "success" | "error"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = "success") => {
    const id = crypto.randomUUID()

    const newToast = { id, message, type }

    setToasts((prev) => [...prev, newToast])

    // auto remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* TOAST UI */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              px-4 py-3 rounded-md shadow-md text-white text-center min-w-[200px]
              transition-all duration-300 ease-in-out
              ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}
            `}
          >
            {toast.message}
          </div>
        ))}
      </div>

    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}