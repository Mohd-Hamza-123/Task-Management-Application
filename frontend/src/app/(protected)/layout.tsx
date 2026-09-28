import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function layout({ children }: { children: React.ReactNode }) {

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("layout user : ", user)

  if (!user) redirect('/login')

  return (
    <>{children}</>
  )
}
