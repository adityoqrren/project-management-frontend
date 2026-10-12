"use client";

import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">

      <Navbar />

      <main className="min-h-0 flex-1">
        {children}
      </main>

    </div>
  );
}