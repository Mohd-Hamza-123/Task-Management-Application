"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  ListTodo,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  {
    id: "2",
    title: "Setup authentication",
    description: "Configure Google OAuth authentication",
    status: "completed",
    priority: "high",
    dueDate: "2026-09-25",
    assignedTo: {
      name: "Priya Singh",
      email: "priya@example.com",
      initials: "PS",
    },
  },
  {
    id: "3",
    title: "Create task API",
    description: "Build Flask APIs for task management",
    status: "pending",
    priority: "medium",
    dueDate: "2026-09-30",
    assignedTo: {
      name: "Amit Kumar",
      email: "amit@example.com",
      initials: "AK",
    },
  },
  {
    id: "4",
    title: "Setup email notifications",
    description: "Send Gmail notifications for task events",
    status: "pending",
    priority: "low",
    dueDate: "2026-10-02",
    assignedTo: {
      name: "Neha Verma",
      email: "neha@example.com",
      initials: "NV",
    },
  },
  {
    id: "5",
    title: "Deploy backend API",
    description: "Deploy Flask application to production",
    status: "in_progress",
    priority: "medium",
    dueDate: "2026-10-04",
    assignedTo: {
      name: "Arjun Mehta",
      email: "arjun@example.com",
      initials: "AM",
    },
  },
];

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

export default function DashboardPage() {
  const [tasks] = useState<Task[]>(dummyTasks);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
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
         <SidebarUserMenu/>
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

            <Avatar className="h-8 w-8">
              <AvatarFallback>HA</AvatarFallback>
            </Avatar>
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
            <CreateTaskDialog/>
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
              
              <div className="overflow-x-auto px-4 pt-4 md:px-6">
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
              </div>

             
              <div className="mt-4">
                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ListTodo className="mb-3 h-10 w-10 text-muted-foreground" />

                    <h3 className="font-medium">
                      No tasks found
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Try changing your search or filter.
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

/* -------------------------------- */
/* Task row                         */
/* -------------------------------- */

function TaskRow({ task }: { task: Task }) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

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
      <div className="flex items-center gap-3 lg:w-44">
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
      </div>

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

          <DropdownMenuItem className="text-destructive">
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}