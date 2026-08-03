export type ProjectStatus =
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "ARCHIVED"

export type ProjectCreation = {
  name: string,
  description: string
}

export type ProjectResponse = {
  projectId: string;
  name: string;
  owner?: string; // only available in get project by id
  role?: string; // only available in get projects
  description: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  deletedAt?: string | null;
};

export type Project = {
  id: string;
  name: string;
  owner?: string; // only available in get project by id
  role?: Role; // only available in get projects
  description: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  deletedAt?: string | null;
};

export type User = {
  id: string
  name: string
  avatar: string
}

export type Role = "MEMBER" | "LEADER"


export type Member = {
  memberId: string,
  userId: string,
  name: string,
  username?: string,
  role: Role,
  isActive: boolean
}

export type DashboardProject = {
  projectId: string;
  name: string;
  role: string;
};
