"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit,
    ListChecks,
    User,
    Users,
} from "lucide-react";

import { getTask } from "@/lib/api/tasks";
import EditTaskDialog from "@/components/EditTaskDialog";

type TaskStatus = "pending" | "in_progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string | null;
    created_by: string;
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
}

interface GetTaskResponse {
    data: Task;
}

export default function TaskDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data, isLoading, isError, refetch } = useQuery<GetTaskResponse>({
        queryKey: ["tasks", id],
        queryFn: () => getTask(id),
        enabled: !!id,
        retry: false,
    });


    const task = Array.isArray(data?.data) ? data?.data[0] : undefined

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#fcfcfc] px-8 py-10">
                <div className="mx-auto max-w-5xl">
                    <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />

                    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8">
                        <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
                        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-gray-100" />

                        <div className="mt-10 space-y-4">
                            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                            <div className="h-4 w-4/6 animate-pulse rounded bg-gray-100" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (isError || !task) {
        return (
            <main className="min-h-screen bg-[#fcfcfc] px-8 py-10">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft size={16} />
                        Back to Overview
                    </Link>

                    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <ListChecks size={22} />
                        </div>

                        <h1 className="mt-5 font-serif text-2xl text-black">
                            Task not found
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            The task may have been deleted or the URL is incorrect.
                        </p>

                        <Link
                            href="/dashboard"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm text-white transition hover:bg-gray-800"
                        >
                            <ArrowLeft size={16} />
                            Back to Overview
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const status = getStatusDetails(task.status);
    const priority = getPriorityDetails(task.priority);

    console.log(task)

    return (
        <main className="min-h-screen bg-[#fcfcfc] px-8 py-8">
            <div className="mx-auto max-w-5xl">
                {/* Top navigation */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
                    >
                        <ArrowLeft size={16} />
                        Back to Overview
                    </Link>


                    <div className="">
                        <EditTaskDialog task={task} refetch={refetch} />
                    </div>
                </div>

                {/* Main task card */}
                <section className="mt-7 rounded-2xl border border-gray-200 bg-white">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-8 py-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                                    >
                                        {status.label}
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${priority.className}`}
                                    >
                                        {priority.label} priority
                                    </span>
                                </div>

                                <h1 className="font-serif text-3xl font-medium text-black">
                                    {task.title}
                                </h1>

                                <p className="mt-2 text-sm text-gray-500">
                                    Task ID: {task.id}
                                </p>
                            </div>

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                <ListChecks size={23} className="text-gray-700" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="px-8 py-7">
                        <h2 className="font-serif text-lg text-black">Description</h2>

                        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
                            {task.description ? (
                                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                    {task.description}
                                </p>
                            ) : (
                                <p className="text-sm italic text-gray-400">
                                    No description provided.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Task information */}
                    <div className="border-t border-gray-200 px-8 py-7">
                        <h2 className="font-serif text-lg text-black">Task Information</h2>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            {/* Status */}
                            <InfoCard
                                icon={<Clock3 size={18} />}
                                label="Status"
                                value={status.label}
                            />

                            {/* Priority */}
                            <InfoCard
                                icon={<ListChecks size={18} />}
                                label="Priority"
                                value={priority.label}
                            />

                            {/* Due date */}
                            <InfoCard
                                icon={<CalendarDays size={18} />}
                                label="Due Date"
                                value={
                                    task.due_date
                                        ? formatDate(task.due_date)
                                        : "No due date"
                                }
                            />

                            {/* Assigned user */}
                            <InfoCard
                                icon={<Users size={18} />}
                                label="Assigned To"
                                value={task.assigned_to || "Unassigned"}
                            />

                            {/* Created by */}
                            <InfoCard
                                icon={<User size={18} />}
                                label="Created By"
                                value={task.created_by}
                            />

                            {/* Created at */}
                            <InfoCard
                                icon={<CalendarDays size={18} />}
                                label="Created At"
                                value={formatDate(task.created_at)}
                            />
                        </div>
                    </div>

                    {/* Completion information */}
                    {task.status === "completed" && task.completed_at && (
                        <div className="border-t border-gray-200 px-8 py-7">
                            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                    <CheckCircle2 size={20} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-black">
                                        Task completed
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Completed on {formatDate(task.completed_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col gap-3 border-t border-gray-200 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-400">
                            Last updated {formatDate(task.updated_at)}
                        </p>

                        <button
                            onClick={() => router.back()}
                            className="text-sm text-gray-600 transition hover:text-black"
                        >
                            Go back
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}

/* ---------------------------------- */
/* Reusable information card          */
/* ---------------------------------- */

function InfoCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="mt-1 truncate text-sm text-gray-700">{value}</p>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------- */
/* Status                             */
/* ---------------------------------- */

function getStatusDetails(status: TaskStatus) {
    switch (status) {
        case "completed":
            return {
                label: "Completed",
                className: "bg-green-50 text-green-700",
            };

        case "in_progress":
            return {
                label: "In Progress",
                className: "bg-blue-50 text-blue-700",
            };

        default:
            return {
                label: "Pending",
                className: "bg-yellow-50 text-yellow-700",
            };
    }
}

/* ---------------------------------- */
/* Priority                           */
/* ---------------------------------- */

function getPriorityDetails(priority: TaskPriority) {
    switch (priority) {
        case "high":
            return {
                label: "High",
                className: "bg-red-50 text-red-700",
            };

        case "low":
            return {
                label: "Low",
                className: "bg-gray-100 text-gray-600",
            };

        default:
            return {
                label: "Medium",
                className: "bg-orange-50 text-orange-700",
            };
    }
}

/* ---------------------------------- */
/* Date formatter                     */
/* ---------------------------------- */

function formatDate(date: string | null | undefined) {
    if (!date) {
        return "Not set";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsedDate);
}