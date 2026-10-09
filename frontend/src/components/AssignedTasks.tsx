import React, { useMemo, useState } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ListTodo,
    Search,
    CalendarDays,
    Trash,
} from "lucide-react";
import { Input } from './ui/input';
import { Spinner } from './ui/spinner';
import { Separator } from './ui/separator';
import { getAssignedTasks } from '@/lib/api/tasks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import AssignedTaskRow from './AssignedTaskRow';

type TaskStatus = "pending" | "in_progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string;
    assigned_to: string;
    created_by: {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string;
    };
}

export default function AssignedTasks() {

    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const {
        data,
        isPending,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["assigned-tasks"],

        queryFn: ({ pageParam }) => getAssignedTasks(pageParam),

        initialPageParam: 1,

        getNextPageParam: (lastPage) => {
            if (!lastPage.hasNextPage) {
                return undefined;
            }

            return lastPage.nextPage;
        },
    });

    const tasks: Task[] =
        data?.pages.flatMap((page) => page.data) ?? [];

    const handleIntersect = () => {
        // console.log("Visible")
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }

    const targetRef = useIntersectionObserver({ callback: handleIntersect })

    const filteredTasks = useMemo(() => {
        return tasks?.filter((task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(search.toLowerCase()) ||
                task.description?.toLowerCase()?.includes(search.toLowerCase()) ||
                task.created_by.full_name.toLowerCase().includes(search.toLowerCase());

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
                                <AssignedTaskRow key={task.id} task={task} />
                            ))}
                            <div className='flex justify-center' ref={targetRef}>
                                {isFetchingNextPage && <Spinner className='mt-2' />}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

        </Card>
    )
}
