import { apiClient } from "./client"

interface task {
    title: string;
    description?: string;
    assigned_to?: string | null;
    priority: "high" | "medium" | "low";
    due_date?: string | null;
}

export async function createTask(body: task) {
    return apiClient("/api/tasks", {
        method: "POST",
        body: JSON.stringify(body)
    })
}

export async function getTasks() {
    return apiClient("/api/tasks")
}

export async function deleteTask(id : string){
    return apiClient(`/api/tasks/${id}`,{
        method : "DELETE"
    })
}