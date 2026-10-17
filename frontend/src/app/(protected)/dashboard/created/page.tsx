"use client";

import { useState } from "react";
import { Menu, } from "lucide-react";
import SideBar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/users";
import Stats from "@/components/CreatedTaskStats";
import CreatedTasks from "@/components/CreatedTasks";
import CreateTaskDialog from "@/components/CreateTaskDialog";

export default function DashboardPage() {

  const { data, isPending, isError } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  })

  const user = data?.full_name ?? ""

  const [sidebarOpen, setSidebarOpen] = useState(false)


  return (
    <div className="min-h-screen bg-muted/30">

      <SideBar />

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

          {!isPending && !isError && <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">
              Welcome back, {user}
            </p>
          </div>}


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
          <Stats />

          {/* Tasks */}
          <CreatedTasks />
        </main>
      </div>
    </div>
  );
}

