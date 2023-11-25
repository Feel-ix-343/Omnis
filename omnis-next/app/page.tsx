import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Login from "./login"

export default async function() {

  const supabase = createServerComponentClient({cookies})
  const {data: {user}} = await supabase.auth.getUser()
  if (user) {
    return redirect('/planning')
  } 

  return <Login />

}
