"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { UserInfo } from "@/lib/responses";
import { ApiError } from "@/lib/errors";
import { usePathname } from "next/navigation";

type AuthContextType = {
  user: UserInfo | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const res = await getUser();
      setUser(res.data);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setUser(null); // ✅ expected (not logged in)
      }
      else {
        console.error("Auth error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once when app loads
  useEffect(() => {
    if (pathname.startsWith("/auth")) {
      setLoading(false);
      return;
    }
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, refetchUser: fetchUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easier usage
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}