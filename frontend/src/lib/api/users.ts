import { apiClient } from "./client";

export interface User {
  id: string;
  full_name: string;
  email: string;
}

export async function getUsers() {
  return apiClient("/api/users");
}