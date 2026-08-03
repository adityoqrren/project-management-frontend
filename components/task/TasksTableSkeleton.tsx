interface TasksTableSkeletonProps {
  rows?: number;
}

export default function TasksTableSkeleton({
  rows = 5,
}: TasksTableSkeletonProps) {
  return (
    <div className="border rounded-lg overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full min-w-250">

          <thead className="border-b bg-gray-50">

            <tr>
              {[
                "Title",
                "Project",
                "Assignee",
                "Start Date",
                "Due Date",
                "Priority",
                "Status",
              ].map((column) => (
                <th
                  key={column}
                  className="p-4 text-left text-gray-500"
                >
                  {column}
                </th>
              ))}
            </tr>

          </thead>

          <tbody>

            {Array.from({ length: rows }).map((_, row) => (

              <tr
                key={row}
                className="border-b"
              >

                {Array.from({ length: 7 }).map((_, col) => (

                  <td
                    key={col}
                    className="p-4"
                  >
                    <div className="h-4 w-full max-w-32 animate-pulse rounded bg-gray-200" />
                  </td>

                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}