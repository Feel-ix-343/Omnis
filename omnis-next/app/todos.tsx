import Todos from "@/components/todos";
import { Database } from "@/lib/database.types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { cache } from "react";

const getTodos = cache(async () => {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {data: todos, error} = await supabase.from("todos").select("*") // this should never be null
  return todos
})

type Unpacked<T> = T extends (infer U)[] ? U : T;
export type Todo = Unpacked<Awaited<ReturnType<typeof getTodos>>>

export default async function() {
  const todos = await getTodos()

  const supabase = createServerComponentClient<Database>({cookies})
  const {data: {user}} = await supabase.auth.getUser()

  // wait 3 seconds
  await (new Promise(r => setTimeout(r, 3000)))

  if (!user) return

  return <Todos todos={todos} user={user} />
}
