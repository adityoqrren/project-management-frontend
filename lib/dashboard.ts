import { DashboardStatisticsResponse } from "@/types/dashboard";
import { apiFetch } from "./api";

export async function getDashboardStatistics() {
    const result = await apiFetch<{
        status: string;
        statistics: DashboardStatisticsResponse;
    }>("/api/dashboard/statistics");

    return result;
}

import { QueryClient } from "@tanstack/react-query";


// Query
export function invalidateDashboardTasks(
    queryClient: QueryClient
) {
    return Promise.all([
        queryClient.invalidateQueries({
            queryKey: ["dashboardTasks"],
        }),
        queryClient.invalidateQueries({
            queryKey: ["dashboardTaskCounts"],
        })
    ]);
}

export function invalidateDashboardProjects(
    queryClient: QueryClient
) {
    queryClient.invalidateQueries({
        queryKey: ["dashboardProjects"],
    });
}

export function invalidateDashboard(
    queryClient: QueryClient
) {
    invalidateDashboardProjects(queryClient);
    invalidateDashboardTasks(queryClient);
}