'use client'


import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect, useRouter } from "next/navigation"

export default async function () {

  const supabase = createClientComponentClient()
  const handleLogin = async() => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
  }

  return<>
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-7xl">Omnis</h1>
      <p className="text-2xl font-sans">Guided Daily Planning</p>

      <Button className="bg-secondary font-sans mt-10 text-xl border-2 border-neutral-200 rounded-full px-6 py-2" variant="outline" onClick={handleLogin}>Continue With Google</Button>

    </div>
  </>
}

