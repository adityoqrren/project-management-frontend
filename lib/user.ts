import { apiFetch } from "./api";

export type SearchUser = {
  id: string;
  username: string;
  name: string;
  email: string;
};

export async function searchUsers(keyword: string) {
  return apiFetch<{
    status: string;
    data: SearchUser[];
  }>(`/api/users?username=${keyword}`);
}