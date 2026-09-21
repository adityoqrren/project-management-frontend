"use client";

interface TaskFiltersProps {
  assignee: string;
  taskStatus: string;
  priority: string;
  searchInput: string;
  sortBy: string;
  order: "asc" | "desc";
  members: {
    memberId: string;
    name: string;
  }[];
  hasActiveFilters: boolean;
  onAssigneeChange: (value: string) => void;
  onTaskStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onOrderChange: (value: "asc" | "desc") => void;
  onClearFilters: () => void;
}

export default function TaskFilters({
  assignee,
  taskStatus,
  priority,
  searchInput,
  sortBy,
  order,
  members,
  hasActiveFilters,
  onAssigneeChange,
  onTaskStatusChange,
  onPriorityChange,
  onSearchChange,
  onSortByChange,
  onOrderChange,
  onClearFilters,
}: TaskFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:justify-start">
        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Assignee */}
          <select
            value={assignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="
              min-w-[220px]
              rounded-md
              border
              bg-white
              px-3
              py-2
              text-sm
            "
          >
            <option value="">All Assignees</option>

            <option value="unassigned">
              Unassigned
            </option>

            {members.map((member) => (
              <option
                key={member.memberId}
                value={member.memberId}
              >
                {member.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={taskStatus}
            onChange={(e) => onTaskStatusChange(e.target.value)}
            className="
              min-w-[180px]
              rounded-md
              border
              bg-white
              px-3
              py-2
              text-sm
            "
          >
            <option value="">All Statuses</option>

            <option value="TODO">
              Todo
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="DONE">
              Done
            </option>
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="
              min-w-[180px]
              rounded-md
              border
              bg-white
              px-3
              py-2
              text-sm
            "
          >
            <option value="">All Priorities</option>

            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="
                rounded-md
                border
                px-3
                py-2
                text-sm
                text-gray-600
                transition
                hover:border-red-200
                hover:bg-red-50
                hover:text-red-600
              "
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Sorting */}
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative lg:min-w-[320px]">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search task title..."
              className="
                w-full
                rounded-md
                border
                bg-white
                px-3
                py-2
                pr-10
                text-sm
              "
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-gray-700
                "
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="
              min-w-[180px]
              rounded-md
              border
              bg-white
              px-3
              py-2
              text-sm
            "
          >
            <option value="">Sort By</option>

            <option value="title">
              Title
            </option>

            <option value="status">
              Status
            </option>

            <option value="assignee_name">
              Assignee
            </option>

            <option value="priority">
              Priority
            </option>

            <option value="startDate">
              Start Date
            </option>

            <option value="dueDate">
              Due Date
            </option>
          </select>

          {/* Order */}
          <select
            value={order}
            onChange={(e) =>
              onOrderChange(
                e.target.value as "asc" | "desc"
              )
            }
            className="
              min-w-[140px]
              rounded-md
              border
              bg-white
              px-3
              py-2
              text-sm
            "
          >
            <option value="asc">
              Ascending
            </option>

            <option value="desc">
              Descending
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}