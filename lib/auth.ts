import { apiFetch } from "./api";
import { MeResponse } from "./responses";

// LOGIN
export async function login(email: string, password: string) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuthRefresh: true,
  });
}

// REGISTER
export function register(data: {
  email: string;
  username: string;
  password: string;
  name: string;
}) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuthRefresh: true,
  });
}

// GET CURRENT USER
export function getUser() {
  return apiFetch<MeResponse>("/api/auth/info", {
    skipAuthRedirect: true,
  });
}

// LOGOUT
export async function logout() {
  return apiFetch("/api/auth/token", {
    method: "DELETE",
  });
}