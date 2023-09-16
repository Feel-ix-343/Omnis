import { toast } from "@/components/ui/use-toast";
import { Database } from "@/lib/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import useSWR from "swr";

const fetchTasks = async () => {
  // get user
  const supabase = createClientComponentClient<Database>()
  const {data: {user}} = await supabase.auth.getUser()

  // get todos
  const {data} = await supabase.from("todos").select("*").eq('user_id', user!.id)
  return data
}

type Unpacked<T> = T extends (infer U)[] ? U : T;
export type Todo = Unpacked<Awaited<ReturnType<typeof fetchTasks>>>

export default function useTodos () {
  return useSWR("todos", fetchTasks)
}
