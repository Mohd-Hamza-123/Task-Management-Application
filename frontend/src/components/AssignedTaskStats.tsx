import React from "react";
import { getAssignedTasksStats } from "@/lib/api/tasks";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, } from "@/components/ui/card";

import {
    Users,
    Clock3,
    ListTodo,
    CheckCircle2,
} from "lucide-react";


export default function AssignedTaskStats() {


    const { isPending, data, refetch } = useQuery({
        queryFn: getAssignedTasksStats,
        queryKey: ["assigned-task-stats"]
    })

    const stats = data

    if (isPending) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <StatCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Total Tasks"
                value={stats.total}
                description="All tasks"
                icon={<ListTodo className="h-5 w-5" />}
            />

            <StatCard
                title="Pending"
                value={stats.pending}
                description="Waiting to start"
                icon={<Clock3 className="h-5 w-5" />}
            />

            <StatCard
                title="In Progress"
                value={stats.inProgress}
                description="Currently working"
                icon={<Users className="h-5 w-5" />}
            />

            <StatCard
                title="Completed"
                value={stats.completed}
                description="Successfully finished"
                icon={<CheckCircle2 className="h-5 w-5" />}
            />
        </div>
    );
}

/* -------------------------------- */
/* Stat card                        */
/* -------------------------------- */

function StatCard({
    title,
    value,
    description,
    icon,
}: {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-5">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>

                <div className="rounded-xl bg-muted p-3">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

/* -------------------------------- */
/* Stat card skeleton               */
/* -------------------------------- */

function StatCardSkeleton() {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-3 w-28" />
                </div>

                <Skeleton className="h-11 w-11 rounded-xl" />
            </CardContent>
        </Card>
    );
}