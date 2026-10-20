"use client";

import { logout } from "@/lib/auth";
import { isApiError } from "@/lib/errors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ErrorDialog from "../ui/ErrorDialog";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "../notification/NotificationBell";
import { useQueryClient } from "@tanstack/react-query";
import { getInitials } from "@/lib/getInitials";
import Image from "next/image"
import { getAvatarColor } from "@/lib/getAvatarColor";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

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

      queryClient.clear();
      setUser(null); // 🔥 langsung clear UI

      // Redirect to login after successful logout
      router.replace("/auth/login");
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
          <NotificationBell />

          <div className="relative" ref={dropdownRef}>
            {/* Avatar button */}
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Open profile menu"
              aria-expanded={open}
              className={`flex h-9 w-9 items-center justify-center overflow-hidden
    rounded-full text-sm font-semibold ring-1 ${user?.id
                  ? getAvatarColor(user.id)
                  : "bg-gray-100 text-gray-600"
                }`}
            >
              {user?.photoProfile ? (
                <Image
                  src={user.photoProfile}
                  alt={`${user.name}'s profile`}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                getInitials(user?.name)
              )}
            </button>

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
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-gray-100"
                >
                  Settings
                </Link>

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