import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    LogOut,
    MoreHorizontal
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Spinner } from './ui/spinner';


export default function SidebarUserMenu() {


    const [name, setName] = useState('')
    const [avatarURL, setAvatarURL] = useState('')
    const [email, setEmail] = useState('')

    const getCurrentUser = async () => {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        // console.log(user)

        if (error || !user) {
            return
        }

        setEmail(user.email || "")
        setName(user.user_metadata.full_name)
        setAvatarURL(user.user_metadata.avatar_url)
    }

    useEffect(() => {
        getCurrentUser()
    }, [])


    const logout = async () => {
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error logging out:', error.message)
        } else {
            // redirect or update UI
            window.location.href = '/login'
        }
    }

    return (
        <div className="border-t p-4">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 flex justify-center items-center">
                    {avatarURL ? <Image src={avatarURL} height={100} width={100} alt={name} className='rounded-full' /> : <Spinner/>}
                </Avatar>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                        {name}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                        {email}
                    </p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            Profile
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={logout} className="cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
