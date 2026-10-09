'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 bg-white">
            {/* Icon / Graphic Area */}
            <div className="mb-8 relative">
                <div className="text-[120px] font-bold text-gray-100 leading-none select-none">
                    404
                </div>
                {/* Subtle floating icon to match your dashboard's icon style */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center shadow-sm">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Text Content */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Page not found
            </h1>
            <p className="text-gray-500 text-sm mb-8 text-center max-w-md">
                Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
            </p>

            {/* Action Buttons - Matching your "Create Task" button style */}
            <div className="flex gap-3">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Go Back
                </button>

                <Link
                    href="/dashboard/created" // Change this to your actual dashboard route
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#111] rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}