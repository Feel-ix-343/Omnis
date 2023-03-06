import { PostgrestError, Session } from "@supabase/supabase-js"
import { CompletedTask, WorkingTask } from "../taskStates"
import { supabase } from "./supabaseClient"

type DBUnscheduledTask = import ("./database.types").Database["public"]["Tables"]["tasks"]["Row"]
type DBWorkingTask = import ("./database.types").Database["public"]["Tables"]["working_tasks"]["Row"]
type DBCompletedTask = import ("./database.types").Database["public"]["Tables"]["completed_tasks"]["Row"]

function taskToDBTask(task: UnscheduledTask, session: Session): DBUnscheduledTask {
  return {
    ...task,
    user_id: session.user.id,
    due_date: task.due_date.toISOString(),
  }
}

function workingTaskToDBWorkingTask(task: WorkingTask, session: Session): DBWorkingTask {
  return {
    id: task.task.task.id,
    ref_task: task.task.task.id,
    urgency: task.task.urgency,
    start_time: task.start_time.toISOString(),
    user_id: session.user.id,
    end_time: task.end_time.toISOString(), // TODO: Fix this; this is from an interface
  }
}

function completedTaskToDBCompletedTask(task: CompletedTask, session: Session): DBCompletedTask {
  return {
    id: task.task.task.id,
    user_id: session.user.id,
    ref_task: task.task.task.id,
    urgency: task.task.urgency,
    start_time: task.start_time.toISOString(),
    completed_time: task.completed_time.toISOString(),
  }
}

function dbUnscheduledTaskToTask(task: DBUnscheduledTask): UnscheduledTask { // TODO: Turn Task into a class so this is more straight forward
  return {
    ...task,
    importance: task.importance as Importance,
    due_date: new Date(task.due_date), // ISOString -> Date
    description: task.description === undefined ? null : task.description,
    steps: task.steps ? task.steps as UnscheduledTask["steps"] : null // TODO: fix error; idk
  }
}

async function dbWorkingTaskToWorkingTask(task: DBWorkingTask): Promise<{data: WorkingTask | null, error: PostgrestError | null}> {
  const {data: refDBTask, error} = await supabase.from("tasks").select("*").eq("id", task.ref_task).single()

  if (error || !refDBTask) return {data: null, error}

  const refUnscheduledTask = dbUnscheduledTaskToTask(refDBTask)

  return {
    data: new WorkingTask(
      {
        task: refUnscheduledTask,
        urgency: task.urgency as Urgency
      },
      new Date(task.start_time),
    ),
    error: null
  }
}

async function dbCompletedTaskToCompletedTask(task: DBCompletedTask): Promise<{data: CompletedTask | null, error: PostgrestError | null}> {
  const {data: refDBTask, error} = await supabase.from("tasks").select("*").eq("id", task.ref_task).single()

  if (error || !refDBTask) return {data: null, error}

  const refUnscheduledTask = dbUnscheduledTaskToTask(refDBTask)

  return {
    data: new CompletedTask (
      {
        task: refUnscheduledTask,
        urgency: task.urgency as Urgency
      },
      new Date(task.start_time),
      new Date(task.completed_time)
    ),
    error: null
  }
}

export async function getTasksFromDB(session: Session): Promise<{data: {unscheduledTasks: UnscheduledTask[] | null, workingTasks: WorkingTask[] | null, completedTasks: CompletedTask[] | null} | null, error: PostgrestError | null}> { 

  const { data: unscheudledTasks, error: unscheduledError } = await supabase.from("tasks").select("*").eq("user_id", session.user.id)
  if (unscheduledError) return {data: null, error: unscheduledError}

  const { data: workingTasks, error: workingError } = await supabase.from("working_tasks").select("*").eq("user_id", session.user.id)
  if (workingError) return {data: null, error: workingError}

  const { data: completedTasks, error: completedError } = await supabase.from("completed_tasks").select('*').eq("user_id", session.user.id)
  if (completedError) return {data: null, error: completedError}

  // TODO: is this slow? Maybe replace it with a join query
  const workingTasksData = workingTasks !== null ? await Promise.all(workingTasks.map(async t => await dbWorkingTaskToWorkingTask(t))) : null
  const completedTasksData = completedTasks !== null ? await Promise.all(completedTasks.map(async t => await dbCompletedTaskToCompletedTask(t))) : null

  // TODO: It shuold return all of the errors, but its find for now
  if (workingTasksData !== null && workingTasksData.some(t => t.error !== null || t.data === null)) return {data: null, error: workingTasksData.find(t => t.error !== null)!.error}
  if (completedTasksData !== null && completedTasksData.some(t => t.error !== null || t.data === null)) return {data: null, error: completedTasksData.find(t => t.error !== null)!.error}


  // TODO: AHHHHH SO UGLY
  return { 
    data: {
      unscheduledTasks: unscheudledTasks !== null ? unscheudledTasks.map(t => dbUnscheduledTaskToTask(t)) : null, // I wish this was rust
      workingTasks: workingTasksData !== null ? workingTasksData.map(t => t.data!) : null,
      completedTasks: completedTasksData !== null ? completedTasksData.map(t => t.data!) : null
    }, error: null}
}


export async function upsertTask(task: UnscheduledTask, session: Session) {
  console.log("Updating", task)
  return await supabase.from("tasks").upsert(taskToDBTask(task, session))
}

export async function upsertWorkingTask(task: WorkingTask, session: Session) {
  console.log("Updating working task", task)
  return await supabase.from("working_tasks").upsert(workingTaskToDBWorkingTask(task, session))
}

export async function upsertCompletedTask(task: CompletedTask, session: Session) {
  console.log("Updating completed task", task)
  return await supabase.from("completed_tasks").upsert(completedTaskToDBCompletedTask(task, session))
}

export async function upsertTasks(tasks: UnscheduledTask[], session: Session) {
  console.log("Updating", tasks)

  return await supabase.from("tasks").upsert(tasks.map(task => taskToDBTask(task, session)))
}

export async function upsertWorkingTasks(tasks: WorkingTask[], session: Session) {
  console.log("Updating", tasks)
  return await supabase.from("working_tasks").upsert(tasks.map(task => workingTaskToDBWorkingTask(task, session)))
}

export async function upsertCompletedTasks(tasks: CompletedTask[], session: Session) {
  console.log("Updating", tasks)
  return await supabase.from("completed_tasks").upsert(tasks.map(task => completedTaskToDBCompletedTask(task, session)))
}

export async function deleteDBTask(task: UnscheduledTask) {
  return await supabase.from("tasks").delete().eq("id", task.id)
}

export async function deleteDBWorkingTasks(tasks: WorkingTask[]) {
  return await supabase.from("working_tasks").delete().eq("id", tasks.map(t => t.task.task.id))
}

export async function deleteDBCompletedTasks(tasks: CompletedTask[]) {
  return await supabase.from("completed_tasks").delete().eq("id", tasks.map(t => t.task.task.id))
}
