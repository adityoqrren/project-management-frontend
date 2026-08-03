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
}

export interface MeResponse {
  status: "success";
  data: UserInfo;
}