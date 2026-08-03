"use client";

import { Project } from "@/types/project";
import {
  createContext,
  useContext,
} from "react";

type ProjectContextType = {
  project: Project;
  canManageProject: boolean;
};

const ProjectContext =
  createContext<ProjectContextType | null>(null);

export function ProjectProvider({
  value,
  children,
}: {
  value: ProjectContextType;
  children: React.ReactNode;
}) {
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);

  if (!ctx) {
    throw new Error(
      "useProject must be used inside ProjectProvider"
    );
  }

  return ctx;
}