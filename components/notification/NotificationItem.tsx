"use client";

import { Notification } from "@/types/notifications";
import { formatRelativeTime } from "@/utils/date";
import { getNotificationTypeMeta } from "./helper/NotificationTypeMeta";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getNotificationHref, markNotificationAsRead, UnreadCountResponse } from "@/lib/notifications";

interface NotificationItemProps {
    notification: Notification;
    onNavigate?: () => void
}

export default function NotificationItem({
    notification,
    onNavigate
}: NotificationItemProps) {
    const router = useRouter();

    const queryClient =
        useQueryClient();

    const {
        icon: Icon,
        iconClassName,
    } = getNotificationTypeMeta(notification.type);

    const handleClick = async () => {

        try {
            const href =
                getNotificationHref(notification);

            if (!href) {
                return;
            }

            try {
                if (!notification.isRead) {

                    await markNotificationAsRead(
                        notification.id
                    );

                    //optimistic update for unread count
                    queryClient.setQueryData(
                        ["notificationUnreadCount"],
                        (old: UnreadCountResponse) => {

                            if (!old) return old;

                            return {
                                ...old,
                                data: {
                                    count: Math.max(
                                        0,
                                        old.data.count - 1
                                    ),
                                },
                            };

                        }
                    );

                    queryClient.invalidateQueries({
                        queryKey: ["notifications"],
                    });

                    queryClient.invalidateQueries({
                        queryKey: ["notificationUnreadCount"],
                    });

                }

                if (
                    notification.entityType &&
                    notification.entityId
                ) {
                    const queryEntityKey = [notification.entityType == "task" ? "task" : "project", notification.entityId];
                    const queryDashboardKey = [notification.entityType == "task" ? "dashboardTasks" : "dashboardProjects",];

                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: queryEntityKey
                        }),
                        queryClient.invalidateQueries({
                            queryKey: queryDashboardKey
                        }),
                    ])

                }

                onNavigate?.()
                router.push(href);
            } catch (error) {
                console.error(error);
            }

        }
        catch (error) {

            console.error(error);

        }

    };


    return (
        <button
            onClick={handleClick}
            className={`
        w-full
        border-b
        px-4
        py-3
        text-left
        hover:bg-gray-50
        cursor-pointer
        ${!notification.isRead
                    ? "bg-blue-50"
                    : ""
                }
      `}
        >
            <div className="flex gap-2 items-center">
                <Icon
                    size={18}
                    className={`shrink-0 ${iconClassName}`}
                />
                <span className="font-medium">
                    {notification.title}
                </span>
            </div>

            <p className="mt-1 text-sm text-gray-600">
                {notification.message}
            </p>

            <p className="mt-2 text-xs text-gray-400">
                {formatRelativeTime(notification.createdAt)}
            </p>

        </button>
    );
}