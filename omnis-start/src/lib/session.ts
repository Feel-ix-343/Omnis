import { redirect } from "solid-start"
import { supabase } from "./supabaseClient"

export default async () => {

  const {data, error} = await supabase.auth.getSession()
  if (error || data.session === null) { 
    throw redirect("/login")
  }

  return data.session

}
