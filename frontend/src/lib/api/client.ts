import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_FLASK_API_URL is not defined");
}

export async function apiClient<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token && {
        Authorization: `Bearer ${session.access_token}`,
      }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.error || error?.message || "Something went wrong"
    );
  }

  // 204 No Content or empty body: nothing to parse
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}