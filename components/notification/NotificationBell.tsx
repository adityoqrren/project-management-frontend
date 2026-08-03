"use client";

import { getUnreadNotificationCount } from "@/lib/notifications";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";


export default function NotificationBell() {
    const [open, setOpen] = useState(false);

    const dropdownRef =
        useRef<HTMLDivElement>(null);

    const { data } = useQuery({
        queryKey: ["notificationUnreadCount"],
        queryFn: getUnreadNotificationCount,
    });

    const unreadCount = data?.data.count ?? 0;

    const badgeText =
        unreadCount > 99
            ? "99+"
            : unreadCount.toString();

    useEffect(() => {

        function handleClickOutside(
            event: MouseEvent
        ) {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target as Node
                )
            ) {
                setOpen(false);
            }

        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        // for cleaning up
        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            <button
                className="
        relative
        rounded-md
        p-2
        hover:bg-gray-100
      "
                onClick={() => setOpen((prev) => !prev)}
            >
                <Bell size={20} />

                {unreadCount > 0 && (
                    <span
                        className="
            absolute
            -right-1
            -top-1
            flex
            h-5
            min-w-5
            items-center
            justify-center
            rounded-full
            bg-red-500
            px-1
            text-[10px]
            font-semibold
            text-white
          "
                    >
                        {badgeText}
                    </span>
                )}
            </button>

            <NotificationDropdown open={open}
                onClose={() => { setOpen(false) }} />
        </div>
    );
}