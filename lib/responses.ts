export interface LoginResponse {
  status: "success";
  message: string;
}

export interface UserInfo {
  id: string;
  username: string;
  name: string;
  email: string;
  createdAt: string;
  photoProfile?: string | null;
}

export interface MeResponse {
  status: "success";
  data: UserInfo;
}