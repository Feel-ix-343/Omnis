import { Badge } from "@/components/ui/badge";
import Matrix from "./matrix";
import { SupabaseClient, createServerActionClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";
import { revalidatePath } from "next/cache";

export default async function() {

  const supabase = createServerComponentClient<Database>({cookies})

  const tasks = await eisenhowerTasks(supabase)
  console.log({tasks})

  if (tasks === null) {
    return <>No Tasks</>
  }

  return <>
    <h1 className="text-lg">Tasks for: <Badge>Make Omnis</Badge></h1>
    <Matrix eisenhowerTodos={tasks} />
  </>
}

export type EisenhowerTasks = NonNullable<Awaited<ReturnType<typeof eisenhowerTasks>>>

async function eisenhowerTasks(supabase: SupabaseClient<Database>) {
  const {data: todos} = await supabase.from("eisenhower").select("task_id, priority, todos(task, is_complete)").order("order_id"); // handle error using the nextjs error thing
  if (!todos) return null

  type Task = typeof todos[number]

  const filterMap = (data: typeof todos) => (pred: (t: Task) => boolean) => {
    return data?.filter(pred).map(t => ({task_id: t.task_id, ...t.todos}))
  }

  return {
    "do_now": filterMap(todos)(t => t.priority == "do_now"),
    "do_later": filterMap(todos)(t => t.priority == "do_later"),
    "delegate": filterMap(todos)(t => t.priority == "delegate"),
    "dont_do":  filterMap(todos)(t => t.priority == "dont_do"),
  } satisfies Record<Task['priority'], ReturnType<ReturnType<typeof filterMap>>>
}



