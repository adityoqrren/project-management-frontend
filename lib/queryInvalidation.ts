import { QueryClient } from "@tanstack/react-query";

export async function invalidateAfterProjectMutation(
  queryClient: QueryClient
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ["projects"],
    }),

    queryClient.invalidateQueries({
      queryKey: ["dashboardProjects"],
    }),
  ]);
}