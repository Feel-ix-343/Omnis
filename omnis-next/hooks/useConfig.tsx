import { Database } from "@/lib/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import useSWR from "swr";

async function fetch() {
  const supabase = createClientComponentClient<Database>()
  //get user
  const {data: {user}} = await supabase.auth.getUser()
  const {data} = await supabase.from('config').select("*").eq('user_id', user!.id).single()
  return data
}

export function useConfig() {
  return useSWR('config', fetch)
}
