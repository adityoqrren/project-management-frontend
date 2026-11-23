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
  description: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  archivedAt?: string | null;
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
  archivedAt?: string | null;
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
  photoProfile?: string | null,
  role: Role,
  isActive: boolean
}

export type MemberTaskSummary = {
  memberId: string;
  projectId: string;
  unfinishedTasks: {
    total: number;
    todo: number;
    inProgress: number;
  };
  completedTasks: {
    total: number;
  };
};

export type DashboardProject = {
  projectId: string;
  name: string;
  role: string;
};
