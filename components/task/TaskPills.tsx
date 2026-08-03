interface TaskCounts {
  all: number;
  todo: number;
  inProgress: number;
  dueSoon: number;
  overdue: number;
  done: number;
}

interface TaskPillsProps {
  counts?: TaskCounts;
  loading: boolean;
  taskStatus: string;
  dueFilter: string;
  onChange: (
    taskStatus: string,
    dueFilter: string
  ) => void;
}

export default function TaskPills({
  counts,
  loading,
  taskStatus,
  dueFilter,
  onChange,
}: TaskPillsProps) {

  const pills = [
    {
      label: "All",
      count: counts?.all ?? 0,
      active:
        taskStatus === "" &&
        dueFilter === "",
      onClick: () => onChange("", ""),
    },
    {
      label: "Todo",
      count: counts?.todo ?? 0,
      active: taskStatus === "TODO",
      onClick: () => onChange("TODO", ""),
    },
    {
      label: "In Progress",
      count: counts?.inProgress ?? 0,
      active: taskStatus === "IN_PROGRESS",
      onClick: () => onChange("IN_PROGRESS", ""),
    },
    {
      label: "Due Soon",
      count: counts?.dueSoon ?? 0,
      active: dueFilter === "dueSoon",
      onClick: () => onChange("", "dueSoon"),
    },
    {
      label: "Overdue",
      count: counts?.overdue ?? 0,
      active: dueFilter === "overdue",
      onClick: () => onChange("", "overdue"),
    },
    {
      label: "Done",
      count: counts?.done ?? 0,
      active: taskStatus === "DONE",
      onClick: () => onChange("DONE", ""),
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">

      {pills.map((pill) => (

        <button
          key={pill.label}
          onClick={pill.onClick}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            transition

            ${
              pill.active
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }
          `}
        >
          {pill.label}

          <span className="ml-2 font-medium">
            {pill.count}
          </span>

        </button>

      ))}

    </div>
  );
}