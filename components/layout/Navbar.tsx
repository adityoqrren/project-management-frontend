"use client";

import { logout } from "@/lib/auth";
import { isApiError } from "@/lib/errors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ErrorDialog from "../ui/ErrorDialog";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "../notification/NotificationBell";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading } = useAuth();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { setUser } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout with error handling
  const handleLogout = async () => {
    try {
      await logout();

      setUser(null); // 🔥 langsung clear UI

      // Redirect to login after successful logout
      router.push("/auth/login");
    } catch (err: unknown) {
      // Check if error is ApiError
      if (isApiError(err)) {
        setError(err.message);
      } else {
        setError("Unexpected error during logout");
      }
    }
  };

  return (
    <>
      <nav className="flex h-14 items-center justify-between border-b bg-white px-6">
        {/* Logo */}
        <div className="font-semibold text-lg">TaskFlow</div>

        {/* Menu */}
        <div className="flex gap-6 text-sm">
          <Link href="/">Home</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/tasks">Tasks</Link>
        </div>

        {/* Avatar + Dropdown */}
        <div className="flex items-center gap-3">
          <NotificationBell/>

          <div className="relative" ref={dropdownRef}>
            {/* Avatar button */}
            <div
              onClick={() => setOpen((prev) => !prev)}
              className="w-8 h-8 bg-gray-300 rounded-full cursor-pointer"
            />

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-md border p-3 z-50">
                {/* User info */}
                <div className="mb-2">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>

                <hr className="my-2" />

                {/* Settings */}
                <button className="w-full text-left text-sm py-1 hover:bg-gray-100 rounded px-2">
                  Settings
                </button>

                <hr className="my-2" />

                {/* Logout */}
                <button className="w-full text-left text-sm py-1 text-red-500 hover:bg-red-50 rounded px-2"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* Reusable Error Dialog */}
      {error && (
        <ErrorDialog
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
}