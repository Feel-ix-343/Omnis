import { PostgrestError, Session } from "@supabase/supabase-js"
import { Goal } from "~/components/SettingsView"
import { Importance, UnscheduledTask, Urgency } from "../autoscheduling"
import { CompletedTask, WorkingTask } from "../taskStates"
import { supabase } from "./supabaseClient"

type DBUnscheduledTask = import ("./database.types").Database["public"]["Tables"]["tasks"]["Row"]
type DBWorkingTask = import ("./database.types").Database["public"]["Tables"]["working_tasks"]["Row"]
type DBCompletedTask = import ("./database.types").Database["public"]["Tables"]["completed_tasks"]["Row"]
type DBGoal = import ("./database.types").Database["public"]["Tables"]["goals"]["Row"]

function goalToDBGoal(goal: Goal, session: Session): DBGoal {
  return {
    ...goal,
    user_id: session.user.id
  }
}

function taskToDBTask(task: UnscheduledTask, session: Session): DBUnscheduledTask {
  console.log(task)
  return {
    ...task,
    user_id: session.user.id,
    due_date: task.due_date.toISOString(),
    start_date: task.start_date !== null ? task.start_date.toISOString() : null,
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
  let out = {
    ...task,
    importance: task.importance as Importance,
    due_date: new Date(task.due_date), // ISOString -> Date,
    start_date: task.start_date ? new Date(task.start_date) : null,
    description: task.description === undefined ? null : task.description,
    steps: task.steps ? task.steps as UnscheduledTask["steps"] : null // TODO: fix error; idk

  }

  console.log(out)
  return out
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

export async function getTasksFromDB(session: Session): Promise<{data: {unscheduledTasks: UnscheduledTask[] | null, workingTask: WorkingTask | null, completedTasks: CompletedTask[] | null} | null, error: PostgrestError | null}> { 

  const { data: unscheudledTasks, error: unscheduledError } = await supabase.from("tasks").select("*").eq("user_id", session.user.id)
  if (unscheduledError) return {data: null, error: unscheduledError}

  const { data: workingTaskRes, error: workingError } = await supabase.from("working_tasks").select("*").eq("user_id", session.user.id).maybeSingle()
  if (workingError) return {data: null, error: workingError}

  const { data: completedTasksRes, error: completedError } = await supabase.from("completed_tasks").select('*').eq("user_id", session.user.id)
  if (completedError) return {data: null, error: completedError}

  console.log("workingTaskRes", workingTaskRes)
  // TODO: is this slow? Maybe replace it with a join query
  const workingTaskData = workingTaskRes !== null ? await dbWorkingTaskToWorkingTask(workingTaskRes) : null
  const completedTasksData = completedTasksRes !== null ? await Promise.all(completedTasksRes.map(async t => await dbCompletedTaskToCompletedTask(t))) : null

  // TODO: It shuold return all of the errors, but its find for now
  if (workingTaskData !== null && workingTaskData.error !== null) return {data: null, error: workingTaskData.error}
  if (completedTasksData !== null && completedTasksData.some(t => t.error !== null || t.data === null)) return {data: null, error: completedTasksData.find(t => t.error !== null)!.error}

  const workingTask = workingTaskData !== null ? workingTaskData.data : null
  const completedTasks = completedTasksData !== null ? completedTasksData.map(t => t.data!) : null

  const filteredUnscheduledTasks: UnscheduledTask[] | null = unscheudledTasks !== null ? (unscheudledTasks.filter(t => workingTask?.task.task.id !== t.id && !(completedTasks ?? []).some(ct => ct.task.task.id == t.id))).map(t => dbUnscheduledTaskToTask(t)) : null


  // TODO: AHHHHH SO UGLY
  return { 
    data: {
      unscheduledTasks: filteredUnscheduledTasks,
      workingTask: workingTask, 
      completedTasks
    }, error: null}
}

export async function getGoalsFromDB(session: Session) {
  const {data, error} = await supabase.from('goals').select("*").eq("user_id", session.user.id)
  if (error) return {data: null, error: error}
  if (data.length === 0) return {data: null, error: null}

  return {
    data: data as Goal[],
    error: null
  }
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

export async function upsertCompletedTasks(tasks: CompletedTask[], session: Session) {
  console.log("Updating", tasks)
  return await supabase.from("completed_tasks").upsert(tasks.map(task => completedTaskToDBCompletedTask(task, session)))
}

export async function deleteDBTask(task: UnscheduledTask) {
  return await supabase.from("tasks").delete().eq("id", task.id)
}

export async function deleteDBWorkingTasks(task: WorkingTask) {
  return await supabase.from("working_tasks").delete().eq("id", task.task.task.id)
}

export async function deleteDBCompletedTasks(tasks: CompletedTask[]) {
  return await supabase.from("completed_tasks").delete().eq("id", tasks.map(t => t.task.task.id))
}


export async function upsertDBGoal(goal: Goal, session: Session) {
  console.log("Updating", goalToDBGoal(goal, session))
  return await supabase.from("goals").upsert(goalToDBGoal(goal, session))
}

export async function deleteDBGoal(goal: Goal, session: Session) {
  console.log("Deleting", goal)
  return await supabase.from("goals").delete().eq("id", goal.id)
}
