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

export interface UpdateMyProfileResponse {
  status: string;
  message: string;
  data: {
    id: string;
    username: string;
    name: string;
    email: string;
    createdAt: string;
    photoProfile: string | null;
  };
}

export interface UpdateMyProfilePhotoResponse {
  status: string;
  message: string;
  data: {
    userId: string;
    photoProfile: string | null;
  };
}

export async function updateMyProfile(data: { name: string }) {
  return apiFetch<UpdateMyProfileResponse>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function uploadMyProfilePhoto(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  return apiFetch<UpdateMyProfilePhotoResponse>(
    "/api/users/me/photo",
    {
      method: "POST",
      body: formData,
    }
  );
}

export async function deleteMyProfilePhoto() {
  return apiFetch<UpdateMyProfilePhotoResponse>(
    "/api/users/me/photo",
    {
      method: "DELETE",
    }
  );
}