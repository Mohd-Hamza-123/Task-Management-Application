import React, { useEffect, useMemo, useState } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { deleteTask as removeTask } from '@/lib/api/tasks';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ListTodo,
    Search,
    CalendarDays,
    MoreHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '@/lib/api/tasks';
import { Spinner } from './ui/spinner';
import { toast } from './ui/toast';

type TaskStatus = "pending" | "in_progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    assignedTo: {
        name: string;
        email: string;
        initials: string;
    };
}

const dummyTasks: Task[] = [
    {
        id: "1",
        title: "Design landing page",
        description: "Create the initial landing page design",
        status: "in_progress",
        priority: "high",
        dueDate: "2026-09-28",
        assignedTo: {
            name: "Rahul Sharma",
            email: "rahul@example.com",
            initials: "RS",
        },
    },
];



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

export default function Tasks() {


    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");

    const { data, isPending, isError, refetch } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    const tasks: Task[] = data?.data || []
    console.log(tasks)

    const filteredTasks = useMemo(() => {
        return tasks?.filter((task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(search.toLowerCase()) ||
                task.description.toLowerCase().includes(search.toLowerCase()) ||
                task.assignedTo.name.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                activeTab === "all" || task.status === activeTab;

            return matchesSearch && matchesStatus;
        });
    }, [tasks, search, activeTab]);




    const stats = {
        total: tasks.length,
        pending: tasks.filter((task) => task.status === "pending").length,
        inProgress: tasks.filter((task) => task.status === "in_progress")
            .length,
        completed: tasks.filter((task) => task.status === "completed")
            .length,
    };




    return (
        <Card className="mt-8">
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                    <div>
                        <CardTitle>Tasks</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View and manage tasks assigned to your team.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </CardHeader>

            <Separator />

            <CardContent className="p-0">

                {!isPending && <div className="overflow-x-auto px-4 pt-4 md:px-6">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                    >
                        <TabsList>
                            <TabsTrigger value="all">
                                All
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {stats.total}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger value="pending">
                                Pending
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {stats.pending}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger value="in_progress">
                                In Progress
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {stats.inProgress}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger value="completed">
                                Completed
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {stats.completed}
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>}


                <div className="mt-4">
                    {isPending ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">

                            <ListTodo className="mb-3 h-10 w-10 text-muted-foreground" />

                            <h3 className="font-medium">
                                {!isPending && filteredTasks.length === 0 ? `To Tasks found` : `Loading Tasks`}
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {!isPending && filteredTasks.length === 0 ? `Try another filter` : <Spinner />}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredTasks.map((task) => (
                                <TaskRow key={task.id} task={task} />
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>

        </Card>
    )
}

/* -------------------------------- */
/* Task row                         */
/* -------------------------------- */

function TaskRow({ task }: { task: Task }) {

    const status = statusConfig[task.status];
    const priority = priorityConfig[task.priority];

    const { refetch } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    const deleteTask = async (id: string) => {
        try {
            console.log(id)
            const res = await removeTask(id)
            refetch()
            console.log(res)
            toast.add({
                title: "Task Deleted"
            })
        } catch (error) {
            toast.add({
                type: 'error',
                title: "Task not deleted"
            })
        }
    }

    const formattedDate = new Date(task.dueDate).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );

    return (
        <div className="group flex flex-col gap-4 px-4 py-5 transition hover:bg-muted/40 md:px-6 lg:flex-row lg:items-center">
            {/* Task */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                    <div
                        className={`mt-2 h-2 w-2 shrink-0 rounded-full ${status.dot}`}
                    />

                    <div className="min-w-0">
                        <h3 className="truncate font-medium">
                            {task.title}
                        </h3>

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
            {/* <div className="flex items-center gap-3 lg:w-44">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                        {task.assignedTo.initials}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                        {task.assignedTo.name}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                        {task.assignedTo.email}
                    </p>
                </div>
            </div> */}

            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger>

                    <MoreHorizontal className="h-4 w-4" />

                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        View task
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        Edit task
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="text-destructive" onClick={() => deleteTask(task.id)}>
                        Delete task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}