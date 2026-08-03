import { ProjectStatistics } from "@/lib/project";
import {
  ClipboardList,
  Circle,
  LoaderCircle,
  CircleCheckBig,
} from "lucide-react";


interface Props {
  statistics: ProjectStatistics;
}

export default function ProjectStatisticsCards({
  statistics,
}: Props) {
  const cards = [
    {
      title: "Total Tasks",
      value: statistics.totalTasks,
      icon: ClipboardList,
    },
    {
      title: "Todo",
      value: statistics.todo,
      icon: Circle,
    },
    {
      title: "In Progress",
      value: statistics.inProgress,
      icon: LoaderCircle,
    },
    {
      title: "Done",
      value: statistics.done,
      icon: CircleCheckBig,
    },
  ];

  return (
    <div
      className="
        grid
        grid-cols-2
        lg:grid-cols-4
        gap-4
      "
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="
              border
              rounded-lg
              p-5
              bg-white
            "
          >
            <div className="flex items-center gap-2 mb-4">
              <Icon
                size={18}
                className="text-gray-500"
              />

              <span className="text-sm text-gray-500">
                {card.title}
              </span>
            </div>

            <p className="text-3xl font-bold">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}