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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Tasks from "@/components/Tasks";
import { getTasks } from "@/lib/api/tasks";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import SidebarUserMenu from "@/components/SidebarUserMenu";

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
  const [openTaskDialog, setOpenTaskDialog] = useState(false)

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const tasks: Task[] = data?.data || []

  const stats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    inProgress: tasks.filter((task) => task.status === "in_progress")
      .length,
    completed: tasks.filter((task) => task.status === "completed")
      .length,
  };

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
              label="Overview"
              active
            />

            <SidebarItem
              icon={<ListTodo className="h-4 w-4" />}
              label="My Tasks"
            />

            <SidebarItem
              icon={<Users className="h-4 w-4" />}
              label="Team"
            />

            <div className="my-6">
              <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                General
              </p>

              <SidebarItem
                icon={<Settings className="h-4 w-4" />}
                label="Settings"
              />
            </div>
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
            <CreateTaskDialog />
          </div>

          {/* Stats */}
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

          {/* Tasks */}
          <Tasks />
        </main>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* Sidebar item                     */
/* -------------------------------- */

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
    >
      {icon}
      {label}
    </button>
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
