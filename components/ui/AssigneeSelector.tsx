"use client"

import { useState } from "react"
import Avatar from "./Avatar"
import { Member, User } from "@/types/project"

interface AssigneeSelectorProps {
  users: Member[]
  value?: Member | null
  onChange: (user: Member | null) => void
}

export default function AssigneeSelector({
  users,
  value,
  onChange,
}: AssigneeSelectorProps) {

  const [open, setOpen] = useState(false)

  return (
    <div className="relative">

      {/* Selected User */}

      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 border rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50"
      >

        {value ? (
          <>
            {/* <Avatar src={value.avatar} alt={value.name} /> */}

            <div className="flex-1">

              <p className="text-sm font-medium">
                {value?.name}
              </p>

              <p className="text-xs text-gray-400">
                Assigned to this task
              </p>

            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">
            Unassigned
          </p>
        )}

        <span className="text-gray-400">⌄</span>

      </div>

      {/* Dropdown */}

      {open && (
        <div className="absolute bottom-full mb-2 w-full bg-white border rounded-md shadow-lg z-10 max-h-[192px] overflow-y-auto">

          <div
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-500"
          >
            Unassigned
          </div>

          {users.map((user) => (

            <div
              key={user.memberId}
              onClick={() => {
                onChange(user)
                setOpen(false)
              }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >

              {/* <Avatar src={user.avatar} alt={user.name} /> */}

              <span className="text-sm">
                {user.name}
              </span>

            </div>

          ))}

        </div>
      )}

    </div>
  )
}