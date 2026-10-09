"use client";

import { useState } from "react";
import {
    X,
    Bell,
    Menu,
    Users,
    Clock3,
    Settings,
    ListTodo,
    CheckCircle2,
    LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import Tasks from "@/components/CreatedTasks";
import Stats from "@/components/CreatedTaskStats";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SidebarUserMenu from "@/components/SidebarUserMenu";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import SidebarItem from "@/components/SidebarItem";
import AssignedTasks from "@/components/AssignedTasks";
import AssignedTaskStats from "@/components/AssignedTaskStats";

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

export default function DashboardPage() {


    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between px-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <ListTodo className="h-4 w-4" />
                            </div>

                            <span className="text-lg font-semibold">
                                TaskFlow
                            </span>

                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <Separator />

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-4">
                        <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Workspace
                        </p>

                        <SidebarItem
                            icon={<LayoutDashboard className="h-4 w-4" />}
                            label="Created By Me"
                            href="/dashboard/created"
                        />

                        <SidebarItem
                            icon={<ListTodo className="h-4 w-4" />}
                            label="Assigned To Me"
                            href="/dashboard/assigned"
                            active
                        />


                    </nav>

                    {/* User */}
                    <SidebarUserMenu />
                </div>
            </aside>

            {/* Main */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="hidden lg:block">
                        <p className="text-sm text-muted-foreground">
                            Welcome back, Hamza
                        </p>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Bell className="h-5 w-5" />
                        </Button>


                    </div>
                </header>

                {/* Page content */}
                <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
                    {/* Page heading */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                Overview
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage your tasks and keep track of your team's progress.
                            </p>
                        </div>

                    </div>

                    {/* Stats */}
                    <AssignedTaskStats />

                    {/* Assigned Tasks */}
                    <AssignedTasks />
                </main>
            </div>
        </div>
    );
}

