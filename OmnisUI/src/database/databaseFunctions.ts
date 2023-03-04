import { PostgrestError, Session } from "@supabase/supabase-js"
import { supabase } from "./supabaseClient"

function taskToDBTask(task: UnscheduledTask, session: Session): DBTask {
  return {
    ...task,
    description: task.description ?? null,
    user_id: session.user.id,
    date: task.date.toISOString(),
  }
}

function dbTaskToTask(task: DBTask): UnscheduledTask { // TODO: Turn Task into a class so this is more straight forward
  console.log(task.steps)
  return {
    ...task,
    date: new Date(task.date),
    description: task.description === undefined ? null : task.description,
    steps: task.steps ? task.steps.map((step) => step as NonNullable<UnscheduledTask["steps"]>) : null // TODO: fix error; idk
  }
}

export async function getTasksFromDB(session: Session): Promise<{data: UnscheduledTask[] | null, error: PostgrestError | null}> { 

  const { data, error } = await supabase.from("tasks").select("*").eq("user_id", session.user.id)

  if (error) return {data: null, error}

  return {data: data.map(dbTaskToTask), error: null}
}


export async function upsertTask(task: UnscheduledTask, session: Session) {
  return await supabase.from("tasks").upsert(taskToDBTask(task, session))
}

export async function upsertTasks(tasks: UnscheduledTask[], session: Session) {
  console.log(tasks)

  return await supabase.from("tasks").upsert(tasks.map(task => taskToDBTask(task, session)))
}

export async function deleteDBTask(task: UnscheduledTask) {
  return await supabase.from("tasks").delete().eq("id", task.id)
}
