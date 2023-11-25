'use server'

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { EisenhowerTasks } from "./page"
import { Database } from "@/lib/database.types"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"


export async function updateEisenhowerOrdering(todos: EisenhowerTasks) {
  'use server'
  const withIndexes = Object.entries(todos).flatMap(k => k[1].map((t, i) => ( {priority: k[0] as keyof EisenhowerTasks, order_id: i, task_id: t.task_id} )))
  const supabase = createServerActionClient<Database>({cookies})
  const {data, error} = await supabase.from("eisenhower").upsert(withIndexes).select()
  // todo: do something with the error
  revalidatePath("planning/eisenhower")
}

export type EisenhowerEntry = Database["public"]['Tables']['todos']['Insert']

export async function newEisenhowerTodo(todo: EisenhowerEntry, eisenhower: {priority: keyof EisenhowerTasks, order_id: number}) {
  'use server'
  const supabase = createServerActionClient<Database>({cookies})
  const {data, error} = await supabase.from("todos").insert(todo).select("id").single()

  if (!data) return //error

  const {error: er} = await supabase.from("eisenhower").insert({task_id: data.id, order_id: eisenhower.order_id, priority: eisenhower.priority})
  // todo return error

  revalidatePath("planning/eisenhower")
}

// export async function deleteEisenhowerTodo
