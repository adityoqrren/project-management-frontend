"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import ReactQueryProvider from "./QueryProvider";
import { WebSocketProvider } from "./WebSocketProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ReactQueryProvider>
        <WebSocketProvider>
          <ToastProvider>{children}</ToastProvider>
        </WebSocketProvider>
      </ReactQueryProvider>
    </AuthProvider>
  );
}