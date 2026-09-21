"use client";

import DateTimePicker from "@/components/ui/DateTimePicker";
import { Priority, TaskStatus } from "@/types/task";

interface TaskPropertiesProps {
  startDate: string;
  dueDate: string;
  status: string;
  priority: string;
  isActive: boolean;
  canManageTask: boolean;
  canEdit: boolean;
  onStartDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onStatusChange: (value: TaskStatus) => void;
  onPriorityChange: (value: Priority) => void;
  onActiveChange: (value: boolean) => void;
}

const TASK_STATUS_OPTIONS = [
  {
    value: "TODO",
    label: "To do",
  },
  {
    value: "IN_PROGRESS",
    label: "In progress",
  },
  {
    value: "DONE",
    label: "Done",
  },
];

const TASK_PRIORITY_OPTIONS = [
  {
    value: "LOW",
    label: "Low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "HIGH",
    label: "High",
  },
];

export default function TaskProperties({
  startDate,
  dueDate,
  status,
  priority,
  isActive,
  canManageTask,
  canEdit,
  onStartDateChange,
  onDueDateChange,
  onStatusChange,
  onPriorityChange,
  onActiveChange,
}: TaskPropertiesProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm text-gray-500">
          Dates
        </label>

        <div className="mt-1 space-y-2 rounded-md bg-green-100 p-3">

          <DateTimePicker
            label="Start date"
            value={startDate}
            onChange={onStartDateChange}
            required
            readonly={!canManageTask}
          />

          <DateTimePicker
            label="Due date"
            value={dueDate}
            onChange={onDueDateChange}
            readonly={!canManageTask}
          />

        </div>
      </div>

      <div>
        <label
          htmlFor="task-status"
          className="text-sm text-gray-500"
        >
          Status
        </label>

        <select
          id="task-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as TaskStatus)
          }
          disabled={!canEdit}
          className="
            mt-1
            w-full
            rounded-md
            border
            px-3
            py-2
            disabled:bg-gray-100
          "
        >
          {TASK_STATUS_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="task-priority"
          className="text-sm text-gray-500"
        >
          Priority
        </label>

        {canManageTask ? (
          <select
            id="task-priority"
            value={priority}
            onChange={(event) =>
              onPriorityChange(event.target.value as Priority)
            }
            className="
              mt-1
              w-full
              rounded-md
              border
              px-3
              py-2
            "
          >
            {TASK_PRIORITY_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="mt-2 text-sm text-gray-700">
            {priority}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm text-gray-500">
          Active state
        </label>

        {canManageTask ? (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onActiveChange(true)}
              className={`rounded-md px-3 py-2 text-sm ${isActive
                ? "bg-gray-900 text-white"
                : "border text-gray-600 hover:bg-gray-50"
                }`}
            >
              Active
            </button>

            <button
              type="button"
              onClick={() => onActiveChange(false)}
              className={`rounded-md px-3 py-2 text-sm ${!isActive
                ? "bg-gray-900 text-white"
                : "border text-gray-600 hover:bg-gray-50"
                }`}
            >
              Inactive
            </button>
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-700">
            {isActive ? "Active" : "Inactive"}
          </div>
        )}
      </div>
    </div>
  );
}