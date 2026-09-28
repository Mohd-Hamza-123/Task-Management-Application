import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export async function apiClient(
  endpoint: string,
  options?: RequestInit
) {

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // console.log(session)

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
      error?.message || "Something went wrong"
    );
  }

  return response.json();
}