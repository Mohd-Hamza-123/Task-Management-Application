import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { CalendarDays } from 'lucide-react'
import { updateTask } from '@/lib/api/tasks'

import { Play, CheckCircle2, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

const priorityConfig = {
    low: {
        label: "Low",
        className: "bg-slate-50 text-slate-600 border-slate-200",
    },
    medium: {
        label: "Medium",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    high: {
        label: "High",
        className: "bg-red-50 text-red-700 border-red-200",
    },
};


const statusConfig = {
    pending: {
        label: "Pending",
        className: "bg-muted text-muted-foreground",
        dot: "bg-muted-foreground",
    },
    in_progress: {
        label: "In Progress",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
    },
    completed: {
        label: "Completed",
        className: "bg-green-50 text-green-700 border-green-200",
        dot: "bg-green-500",
    },
};

type Task = {
    id: string;
    title: string;
    description: string;
    status: "pending" | "in_progress" | "completed";
    priority: "low" | "medium" | "high";
    due_date: string;
    assigned_to: string;
    created_by: {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string;
    };
};


export default function AssignedTaskRow({ task }: { task: Task }) {
    console.log(task)
    const status = statusConfig[task.status];
    const priority = priorityConfig[task.priority];

    const formattedDate = new Date(task.due_date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
    const pathname = usePathname();


    return (
        <div className="group flex flex-col gap-4 px-4 py-5 transition hover:bg-muted/40 md:px-6 lg:flex-row lg:items-center">
            {/* Task */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                    <div
                        className={`mt-2 h-2 w-2 shrink-0 rounded-full ${status.dot}`}
                    />

                    <div className="min-w-0">
                        <Link href={`/tasks/${task.id}?from=${encodeURIComponent(pathname)}`} className="truncate font-medium">
                            {task.title}
                        </Link>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                            {task.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 lg:w-32">
                <Badge
                    variant="outline"
                    className={status.className}
                >
                    {status.label}
                </Badge>
            </div>

            {/* Priority */}
            <div className="lg:w-24">
                <Badge
                    variant="outline"
                    className={priority.className}
                >
                    {priority.label}
                </Badge>
            </div>

            {/* Due date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground lg:w-32">
                <CalendarDays className="h-4 w-4 shrink-0" />

                <span>{formattedDate}</span>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-3 lg:w-44">

                <Image
                    height={100}
                    width={100}
                    className='h-8 w-8 rounded-full'
                    src={task?.created_by?.avatar_url}
                    alt={task?.created_by?.full_name}
                />

                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                        {task?.created_by?.full_name}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                        {task?.created_by?.email}
                    </p>
                </div>
            </div>

            {/* Actions */}

            <TaskAction task={task} />



        </div >
    )
}



const baseBtn =
    "w-[110px] gap-1.5 rounded-full text-xs font-medium shadow-sm transition-all active:scale-95";

function TaskAction({ task }: { task: Task }) {

    const queryClient = useQueryClient()


    const startTask = async (id: string) => {
        try {
            const response = await updateTask(id, {
                status: "in_progress"
            })
            console.log(response)
            if (response.data) {

                let task = response.data
                console.log(task)

                if (!Array.isArray(task) && task.length < 0) return

                task = task[0]

                queryClient.setQueryData(["tasks"], (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => ({
                            ...page,
                            data: page.data.map((currentTask: any) =>
                                currentTask.id === task.id
                                    ? { ...currentTask, ...task }
                                    : currentTask
                            ),
                        })),
                    };
                });
            }


        } catch (error) {
            const message = error instanceof Error ? error.message : "something went wrong"
            console.error(message)
        }
    }

    const completeTask = async (id: string) => {
        try {
            const response = await updateTask(id, {
                status: "completed"
            })
            console.log(response)

            if (response.data) {

                let task = response.data
                console.log(task)

                if (!Array.isArray(task) && task.length < 0) return

                task = task[0]

                queryClient.setQueryData(["tasks"], (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => ({
                            ...page,
                            data: page.data.map((currentTask: any) =>
                                currentTask.id === task.id
                                    ? { ...currentTask, ...task }
                                    : currentTask
                            ),
                        })),
                    };
                });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "something went wrong"
            console.error(message)
        }
    }


    if (task.status === "pending") {
        return (
            <Button
                size="sm"
                onClick={() => startTask(task.id)}
                className={cn(
                    baseBtn,
                    "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                )}
            >
                <Play className="h-3.5 w-3.5 fill-current" />
                Start
            </Button>
        );
    }

    if (task.status === "in_progress") {
        return (
            <Button
                size="sm"
                onClick={() => completeTask(task.id)}
                className={cn(
                    baseBtn,
                    "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md"
                )}
            >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
            </Button>
        );
    }

    return (
        <Button
            size="sm"
            variant="outline"
            disabled
            className={cn(
                baseBtn,
                "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-none disabled:opacity-100"
            )}
        >
            <CheckCheck className="h-3.5 w-3.5" />
            Finished
        </Button>
    );
}