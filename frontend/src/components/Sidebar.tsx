import React from 'react'
import { Button } from './ui/button';
import { siteConfig } from "@/lib/siteConfig";
import SidebarItem from "@/components/SidebarItem";
import { Separator } from "@/components/ui/separator";
import SidebarUserMenu from "@/components/SidebarUserMenu";
import {
    X,
    ListTodo,
    LayoutDashboard,
} from "lucide-react";
import { usePathname } from 'next/navigation';
import SidebarSocials from '@/components/SidebarSocials';

export default function SideBar() {

    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const path = usePathname()



    return <>

        {/* Mobile overlay */}
        {sidebarOpen && (
            <div
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
            />
        )}
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

                        <h1 className="text-lg font-semibold">
                            {siteConfig.name}
                        </h1>

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
                        active={path === "/dashboard/created"}
                    />

                    <SidebarItem
                        icon={<ListTodo className="h-4 w-4" />}
                        label="Assigned To Me"
                        href="/dashboard/assigned"
                        active={path === "/dashboard/assigned"}
                    />


                </nav>

                {/* Socials */}
                <SidebarSocials />

                {/* User */}
                <SidebarUserMenu />
            </div>
        </aside>

    </>

}
