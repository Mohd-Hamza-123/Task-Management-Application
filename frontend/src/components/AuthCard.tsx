"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface AuthCardProps {
  mode: "login" | "signup";
}

export default function AuthCard({ mode }: AuthCardProps) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-xl font-bold text-white">
            T
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {isLogin
              ? "Sign in to your task management account"
              : "Get started with your task management account"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* Google Icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.805 12.23c0-.79-.07-1.55-.2-2.28H12v4.31h5.49a4.69 4.69 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.67Z"
                fill="#4285F4"
              />
              <path
                d="M12 22c2.76 0 5.07-.91 6.76-2.47l-3.3-2.56c-.91.61-2.07.98-3.46.98-2.66 0-4.91-1.8-5.72-4.22H2.87v2.64A10.21 10.21 0 0 0 12 22Z"
                fill="#34A853"
              />
              <path
                d="M6.28 13.73A6.13 6.13 0 0 1 5.96 12c0-.6.11-1.19.32-1.73V7.63H2.87A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.37l3.2-2.64Z"
                fill="#FBBC05"
              />
              <path
                d="M12 6.05c1.5 0 2.85.52 3.91 1.54l2.93-2.93C17.06 2.92 14.76 2 12 2a10.21 10.21 0 0 0-9.13 5.63l3.41 2.64C7.09 7.85 9.34 6.05 12 6.05Z"
                fill="#EA4335"
              />
            </svg>

            {loading
              ? "Connecting..."
              : isLogin
                ? "Continue with Google"
                : "Sign up with Google"}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">SECURE AUTHENTICATION</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Switch auth mode */}
          <p className="text-center text-sm text-gray-500">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-gray-900 hover:underline"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-gray-900 hover:underline"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}