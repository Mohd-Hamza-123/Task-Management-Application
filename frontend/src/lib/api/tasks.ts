import { apiClient } from "./client"

interface task {
    title?: string;
    description?: string;
    assigned_to?: string | null;
    priority?: "high" | "medium" | "low";
    due_date?: string | null;
    status?: "in_progress" | "completed"
}

export async function createTask(body: task) {
    return apiClient("/api/tasks", {
        method: "POST",
        body: JSON.stringify(body)
    })
}

export async function getTasks(pageParam: number) {
    const params = new URLSearchParams({
        page: String(pageParam),
        limit: "5",
    });

    return apiClient(`/api/tasks?${params.toString()}`);
}

export async function getTaskStats() {
    return apiClient(`/api/task-stats`)
}

export async function getAssignedTasksStats() {
    return apiClient(`/api/assigned-task-stats`)
}

export async function getTask(id: string) {
    return apiClient(`/api/task/${id}`)
}

export async function getAssignedTasks(pageParam: number) {
    const params = new URLSearchParams({
        page: String(pageParam),
        limit: "5",
    });
    return apiClient(`/api/assigned-tasks?${params.toString()}`)
}

export async function deleteTask(id: string) {
    return apiClient(`/api/tasks/${id}`, {
        method: "DELETE"
    })
}

export async function updateTask(id: string, body: task) {
    return apiClient(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
    })
}