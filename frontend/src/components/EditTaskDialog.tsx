"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "./ui/toast";
import { getUsers } from "@/lib/api/users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { updateTask, getTasks, getTaskStats } from "@/lib/api/tasks";

interface User {
    id: string;
    full_name: string;
    email: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string | null;
    priority: "high" | "medium" | "low";
    assigned_to?: string | null;
    due_date?: string | null;
}


export default function EditTaskDialog({
    task
}: { task: Task }) {


    const { isPending, data, refetch } = useQuery({
        queryFn: getTaskStats,
        queryKey: ["created-task-stats"]
    })

    const queryClient = useQueryClient()

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [title, setTitle] = useState(task.title ?? "");
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [dueDate, setDueDate] = useState(task.due_date ?? "");
    const [priority, setPriority] = useState(task.priority ?? "medium");
    const [assignedTo, setAssignedTo] = useState(task.assigned_to ?? "");
    const [description, setDescription] = useState(task.description ?? "");

    // Reset the form whenever a different task is opened, or the dialog reopens
    useEffect(() => {
        if (open) {
            setTitle(task.title ?? "");
            setDescription(task.description ?? "");
            setPriority(task.priority ?? "medium");
            setAssignedTo(task.assigned_to ?? "");
            setDueDate(task.due_date ?? "");
        }
    }, [task, setOpen]);

    async function fetchUsers() {
        try {
            const res = await getUsers();
            setUsers(res);
        } catch (error: unknown) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoadingUsers(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        if (!title.trim()) {
            toast.add({ type: "error", title: "Title cannot be empty" });
            return;
        }

        setLoading(true);

        // Only send fields that actually changed
        const updates: any = {};
        if (title !== task.title) updates.title = title;
        if (description !== (task.description ?? ""))
            updates.description = description || null;
        if (priority !== task.priority) updates.priority = priority;
        if (assignedTo !== (task.assigned_to ?? ""))
            updates.assigned_to = assignedTo || null;
        if (dueDate !== (task.due_date ?? "")) updates.due_date = dueDate || null;

        if (Object.keys(updates).length === 0) {
            setLoading(false);
            setOpen(false);
            return;
        }

        try {
            const updatedTask = await updateTask(task.id, updates);
            
            if (updatedTask.data) {

                let task = updatedTask.data
                console.log(task)

                if(!Array.isArray(task) && task.length < 0) return

                task = task[0]

                queryClient.setQueryData(["created-tasks"], (oldData: any) => {
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


            refetch()
            toast.add({
                title: "Task updated",
            });
            setOpen(false);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "something went wrong";
            toast.add({
                type: "error",
                title: message,
            });
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button variant="ghost" size="icon">
                    <Pencil size={18} />
                </Button>
            </DialogTrigger>

            <DialogContent
                className="
            w-[calc(100%-2rem)]
            max-w-lg
            max-h-[90vh]
            overflow-y-auto
            rounded-lg
            p-4
            sm:p-6
        "
            >
                <DialogHeader>
                    <DialogTitle>Edit task</DialogTitle>

                    <DialogDescription>
                        Update the task details and save your changes.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 py-4">

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Task title
                            </Label>

                            <Input
                                id="title"
                                placeholder="e.g. Create landing page"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description
                            </Label>

                            <Textarea
                                id="description"
                                className="min-h-24 resize-none"
                                placeholder="Describe what needs to be done..."
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setDescription(e.target.value)
                                }
                                rows={4}
                            />
                        </div>

                        {/* Priority + Assignee */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {/* Priority */}
                            <div className="space-y-2">
                                <Label>Priority</Label>

                                <Select
                                    value={priority}
                                    onValueChange={setPriority}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="low">
                                            Low
                                        </SelectItem>

                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>

                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Assignee */}
                            <div className="space-y-2">
                                <Label>Assign to</Label>

                                <Select
                                    value={assignedTo}
                                    onValueChange={setAssignedTo}
                                    disabled={loadingUsers}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select user" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {users?.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id}
                                            >
                                                <div className="flex min-w-0 flex-col">
                                                    <span className="truncate">
                                                        {user.full_name}
                                                    </span>

                                                    <span className="truncate text-xs text-muted-foreground">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Due date */}
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">
                                Due date
                            </Label>

                            <div className="relative">
                                <CalendarIcon
                                    className="
                                absolute
                                left-3
                                top-1/2
                                h-4
                                w-4
                                -translate-y-1/2
                                text-muted-foreground
                            "
                                />

                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) =>
                                        setDueDate(e.target.value)
                                    }
                                    className="w-full pl-10"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}