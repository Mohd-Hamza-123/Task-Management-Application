import { apiClient } from "./client";
import { createClient } from '@/lib/supabase/client'


export interface User {
  id: string;
  full_name: string;
  email: string;
}

export async function getUsers() {
  return apiClient("/api/users");
}

export async function getUser() {
  return apiClient("/api/users/me");
}

export const getCurrentUser = async () => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.user_metadata && user.user_metadata.full_name) {
      return user.user_metadata
    }
    return null
  }
  catch (error) {
    // console.log(error)
    const message = error instanceof Error ? error.message : "something went wrong"
    throw new Error(message)
  }
}