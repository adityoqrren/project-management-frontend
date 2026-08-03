"use client"

import { useProject } from "@/context/ProjectContext"
import { getProjectById } from "@/lib/project"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProjectSidebar() {
  const pathname = usePathname();

  const {
    project,
    canManageProject,
  } = useProject();

  const base = `/projects/${project.id}`;

  const menu = [
    {
      name: "Overview",
      href: base,
      visible: true,
    },
    {
      name: "Tasks",
      href: `${base}/tasks`,
      visible: true,
    },
    {
      name: "Team",
      href: `${base}/team`,
      visible: true,
    },
    {
      name: "Settings",
      href: `${base}/settings`,
      visible: canManageProject,
    },
  ];

  return (
    <aside
      className="
        w-64
        shrink-0
        border-r
        p-6
        h-full
        bg-white
      "
    >
      <h2 className="text-lg font-semibold mb-6">
        {project.name}
      </h2>

      <nav className="flex flex-col gap-2">
        {menu
          .filter((item) => item.visible)
          .map((item) => {
            const active =
              item.href === base
                ? pathname === base
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  px-3 py-2 rounded-md text-sm
                  ${
                    active
                      ? "bg-gray-200 font-medium"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}