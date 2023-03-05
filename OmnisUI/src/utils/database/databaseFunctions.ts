import { PostgrestError, Session } from "@supabase/supabase-js"
import { supabase } from "./supabaseClient"

function taskToDBTask(task: UnscheduledTask, session: Session): DBTask {
  return {
    ...task,
    user_id: session.user.id,
    due_date: task.due_date.toISOString(),
  }
}

function dbTaskToTask(task: DBTask): UnscheduledTask { // TODO: Turn Task into a class so this is more straight forward
  return {
    ...task,
    importance: task.importance as Importance,
    due_date: new Date(task.due_date), // ISOString -> Date
    description: task.description === undefined ? null : task.description,
    steps: task.steps ? task.steps as UnscheduledTask["steps"] : null // TODO: fix error; idk
  }
}

export async function getTasksFromDB(session: Session): Promise<{data: UnscheduledTask[] | null, error: PostgrestError | null}> { 

  const { data, error } = await supabase.from("tasks").select("*").eq("user_id", session.user.id)

  if (error) return {data: null, error}

  return {data: data.map(dbTaskToTask), error: null}
}


export async function upsertTask(task: UnscheduledTask, session: Session) {
  console.log("Updating", task)
  return await supabase.from("tasks").upsert(taskToDBTask(task, session))
}

export async function upsertTasks(tasks: UnscheduledTask[], session: Session) {
  console.log("Updating", tasks)

  return await supabase.from("tasks").upsert(tasks.map(task => taskToDBTask(task, session)))
}

export async function deleteDBTask(task: UnscheduledTask) {
  return await supabase.from("tasks").delete().eq("id", task.id)
}
