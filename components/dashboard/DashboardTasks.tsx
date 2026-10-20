"use client";

import { Task } from "@/types/task";

type DashboardTasksProps = {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  onOpenTask(task: Task): void;
};

const statusStyle = {
  TODO: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
};

const statusLabel = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function DashboardTasks({
  tasks,
  loading,
  error,
  onOpenTask,
}: DashboardTasksProps) {

  return (
    <section>

      {loading ? (

        <div className="rounded-xl border bg-white">

          {Array.from({ length: 5 }).map((_, index) => (

            <div
              key={index}
              className="
                h-20
                border-b
                last:border-b-0
                animate-pulse
                bg-gray-50
              "
            />

          ))}

        </div>

      ) : error ? (

        <div className="text-red-500">
          Failed to load tasks.
        </div>

      ) : tasks.length === 0 ? (

        <div
          className="
            rounded-xl
            border
            bg-white
            py-10
            text-center
            text-gray-400
          "
        >
          No matching tasks.
        </div>

      ) : (

        <div
          className="
            rounded-xl
            border
            divide-y
            overflow-hidden
            bg-white
          "
        >

          {tasks.map((task) => (

            <button
              key={task.id}
              onClick={() => onOpenTask(task)}
              className="
                w-full
                px-5
                py-4

                flex
                items-center
                justify-between

                cursor-pointer

                hover:bg-gray-100
                transition-colors
              "
            >

              <div className="text-left">

                <div className="font-medium">
                  {task.title}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  {task.project?.name}
                </div>

              </div>

              <span
                className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-medium
                  ${statusStyle[task.status]}
                `}
              >
                {statusLabel[task.status]}
              </span>

            </button>

          ))}

        </div>

      )}
    </section>
  );
}

// export default function SimpleTasksList({
//   tasks,
//   loading,
//   error,
// }: DashboardTasksProps) {

//   if (loading) {
//     return (
//       <div className="border rounded-lg bg-white p-6 text-gray-400">
//         Loading tasks...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="border rounded-lg bg-white p-6 text-red-500">
//         Failed to load tasks
//       </div>
//     );
//   }

//   return (
//     <div className="border rounded-lg bg-white overflow-hidden">

//       {tasks.length === 0 ? (

//         <div className="p-6 text-gray-400">
//           No assigned tasks
//         </div>

//       ) : (

//         <div className="divide-y">

//           {tasks.map((task) => (

//             <Link
//               key={task.id}
//               href={`/projects/${task.project.id}/tasks`}
//               className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
//             >

//               <div>

//                 <p className="font-medium">
//                   {task.title}
//                 </p>

//                 <p className="text-sm text-gray-500">
//                   {task.project.name}
//                 </p>

//               </div>

//               <div className="grid grid-cols-[100px_110px] gap-2">

//                 <div className="flex justify-end">
//                   <PriorityBadge priority={task.priority} />
//                 </div>

//                 <div className="flex justify-end">
//                   <TaskStatusBadge status={task.status} />
//                 </div>

//               </div>

//             </Link>

//           ))}

//         </div>

//       )}

//     </div>
//   );
// }