import { UserPlus, Clock3, CheckCircle2, Users, Bell } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface NotificationTypeMeta {
  icon: LucideIcon;
  iconClassName: string;
}

export function getNotificationTypeMeta(
  type: string
): NotificationTypeMeta {
  switch (type) {
    case "task.assigned":
      return {
        icon: UserPlus,
        iconClassName: "text-blue-500",
      };

    case "task.updated":
      return {
        icon: Clock3,
        iconClassName: "text-amber-500",
      };

    case "task.completed":
      return {
        icon: CheckCircle2,
        iconClassName: "text-green-500",
      };

    case "project.member.added":
      return {
        icon: Users,
        iconClassName: "text-purple-500",
      };

    default:
      return {
        icon: Bell,
        iconClassName: "text-gray-500",
      };
  }
}