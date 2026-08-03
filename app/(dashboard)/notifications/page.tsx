"use client"

import NotificationItem from "@/components/notification/NotificationItem";
import NotificationSkeleton from "@/components/notification/NotificationSkeleton";
import { getNotifications, markAllNotificationsAsRead } from "@/lib/notifications";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
;
export default function NotificationPage() {
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["notifications", { limit: 10 }],

        initialPageParam: null as string | null,

        queryFn: ({ pageParam }) =>
            getNotifications({
                limit: 10,
                cursor: pageParam ?? undefined,
            }),

        getNextPageParam: (lastPage) =>
            lastPage.pagination.nextCursor,
    });

    const handleMarkAllAsRead =
        async () => {

            await markAllNotificationsAsRead();

            queryClient.invalidateQueries({
                queryKey: ["notifications"],
            });

            queryClient.invalidateQueries({
                queryKey: ["notificationUnreadCount"],
            });

        };

    const notifications =
        data?.pages.flatMap(
            page => page.data
        ) ?? [];

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <h1 className="text-2xl font-semibold">
                    Notifications
                </h1>
                <NotificationSkeleton />
            </div>
        );
    }

    if (error) {

        return (
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <div className="rounded-lg border p-8 text-center">

                    Failed to load notifications.

                </div>
            </div>
        );

    }

    if (notifications.length === 0) {

        return (

            <div
                className="
                flex
                flex-col
                items-center
                justify-center
                gap-3
                rounded-lg
                border
                py-20
            "
            >

                <Bell size={36} />

                <p
                    className="text-gray-500"
                >
                    You&apos;re all caught up.
                </p>

            </div>

        );

    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">

            <div className="flex items-center justify-between">

                <h1 className="text-2xl font-semibold">
                    Notifications
                </h1>
                <button
                    onClick={handleMarkAllAsRead}
                    className="bg-black hover:bg-gray-400 active:scale-95 px-4 py-2 text-white rounded-md transition-all duration-150 transform"
                >
                    Mark all as read
                </button>

                {/* <div
                    onClick={handleMarkAllAsRead}
                    className="
                    inline-block
                    cursor-pointer
                    bg-red-500
                    hover:bg-red-700
                    px-4
                    py-2
                    rounded-md
                    text-white
                "
                >
                    Mark all as read
                </div> */}

            </div>

            <div
                className="
        rounded-lg
        border
        bg-white
    "
            >

                {notifications.map(
                    notification => (

                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                        />

                    )
                )}

            </div>

            {hasNextPage && (

                <div className="pt-4">

                    <button
                        onClick={() =>
                            fetchNextPage()
                        }
                        disabled={
                            isFetchingNextPage
                        }
                        className="
                w-full
                rounded-lg
                border
                py-3
                hover:bg-gray-50
                disabled:opacity-50
            "
                    >

                        {isFetchingNextPage
                            ? "Loading..."
                            : "Load more"}

                    </button>

                </div>

            )}
        </div>
    );
}