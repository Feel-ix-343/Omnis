import { toast } from "@/components/ui/use-toast";
import { Database } from "@/lib/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import useSWR from "swr";

const fetchTasks = async () => {
  // get user
  const supabase = createClientComponentClient<Database>()
  const {data: {user}} = await supabase.auth.getUser()

  const {data, error} = await supabase.from("eisenhower_ordering").select("*, todos(id, title)")
  if (error) {
    toast({
      title: "Database Error",
      description: "Possibly due to slow internet; " + error.message,
      variant: "destructive"
    })
  }
  return data
}

type Unpacked<T> = T extends (infer U)[] ? U : T;
export type EisenhowerTodo = Unpacked<Awaited<ReturnType<typeof fetchTasks>>>

export default function useEisenhower () {
  return useSWR("eisenhower", fetchTasks)
}
