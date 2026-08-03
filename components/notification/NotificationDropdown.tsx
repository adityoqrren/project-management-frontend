import { getNotifications } from "@/lib/notifications";
import { useQuery } from "@tanstack/react-query";
import NotificationItem from "./NotificationItem";
import NotificationSkeleton from "./NotificationSkeleton";
import { useRouter } from "next/navigation";

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({
  open,
  onClose
}: NotificationDropdownProps) {
  const router = useRouter();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", 5],
    queryFn: () => getNotifications(),
    enabled: open,
  });

  if (!open) {
    return null;
  }

  const notifications = data?.data ?? [];

  return (
    <div
      className="
        absolute
        right-0
        mt-2
        w-96
        rounded-xl
        border
        bg-white
        shadow-lg
        z-50
      "
    >

      <div className="border-b px-4 py-3">

        <h3 className="font-semibold">
          Notifications
        </h3>

      </div>

      <div className="max-h-96 overflow-y-auto">

        {isLoading && (

          <NotificationSkeleton />

        )}

        {error && (

          <div className="p-6 text-center text-sm text-red-500">
            Failed to load notifications.
          </div>

        )}

        {!isLoading &&
          !error &&
          notifications.length === 0 && (

            <div className="p-6 text-center text-sm text-gray-500">
              No notifications.
            </div>

          )}

        {!isLoading &&
          !error &&
          notifications.map((notification) => (

            <NotificationItem
              key={notification.id}
              notification={notification}
              onNavigate={onClose}
            />

          ))}

      </div>

      <div className="border-t p-3">

        <button
          onClick={() => {
            router.push("/notifications");
            onClose();
          }}
          className="
            w-full
            rounded-md
            py-2
            text-sm
            hover:bg-gray-100
          "
        >
          View all notifications
        </button>

      </div>

    </div>
  );
}