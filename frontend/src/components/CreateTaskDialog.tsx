"use client";

import { useEffect, useState } from "react";
import {
    CalendarIcon,
    Loader2,
    Plus,
} from "lucide-react";

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
import { getUsers } from "@/lib/api/users";
import { createTask, getTasks } from "@/lib/api/tasks";
import { toast } from "./ui/toast";
import { useQuery } from "@tanstack/react-query";

interface user {
    id: number;
    full_name: string;
    email: string
}

export default function CreateTaskDialog() {


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [assignedTo, setAssignedTo] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [users, setUsers] = useState<user[]>([])
    const [loadingUsers, setLoadingUsers] = useState(true)

    const { refetch } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTasks,
    });

    async function fetchUsers() {
        try {
            const res = await getUsers()
            // console.log(res)
            setUsers(res)
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

        setLoading(true);

        const taskData = {
            title,
            ...(description && { description }),
            priority: priority as "high" | "medium" | "low",
            assigned_to: assignedTo || null,
            due_date: dueDate || null,
        };

        // console.log("Task data:", taskData);

        try {
            await createTask(taskData)
            refetch()
            toast.add({
                title: "Task Created"
            })

        } catch (error) {
            const message = error instanceof Error ? error.message : "something went wrong"
            toast.add({
                type: 'error',
                title: message
            })
        }

        setLoading(false);

        // Reset form
        setTitle("");
        setDescription("");
        setPriority("medium");
        setAssignedTo("");
        setDueDate("");

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={`flex gap-1 items-center bg-foreground text-background rounded-lg px-2 py-1`}>
                <Plus className="h-4 w-4" />
                Create Task
            </DialogTrigger>

            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>Create a new task</DialogTitle>

                    <DialogDescription>
                        Create a task and assign it to a team member.
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
                                placeholder="Describe what needs to be done..."
                                value={description}
                                onChange={(e: any) =>
                                    setDescription(e.target.value)
                                }
                                rows={4}
                            />
                        </div>

                        {/* Priority + Assignee */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Priority */}
                            <div className="space-y-2">
                                <Label>Priority</Label>

                                <Select
                                    value={priority}
                                    onValueChange={setPriority}
                                >
                                    <SelectTrigger>
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
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select user" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {users?.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id}
                                            >
                                                <div className="flex flex-col">
                                                    <span>{user.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">
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
                                <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) =>
                                        setDueDate(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Create Task
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}