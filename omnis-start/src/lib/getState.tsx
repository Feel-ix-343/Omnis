import { PostgrestError } from "@supabase/supabase-js";
import { DataResponse } from "~/utils/types";
import { CompletedTask, getCompletedTasks} from "./CompletedState";
import { getPlannedTasks } from "./PlannedState";
import { supabase } from "./supabaseClient";
import { Task } from "./Task";
import { TaskState } from "./TaskStateInterface";
import { StateTransition, TaskStateMachine } from "./TaskStateMachine";
import { getWorkingTasks } from "./WorkingState";

export async function getAllTasks(userID: string): DataResponse<Task[], PostgrestError> {


  const {data, error} = await supabase.from("tasks").select("*").eq("user_id", userID)
  if (error) return {data: null, error}
  if (data.length === 0) return {data: null, error: null}

  const tasks = data.map(d => new Task(d))
  return {data: tasks, error: null}

}

export async function getTasksWithState(userID: string): DataResponse<TaskState[], PostgrestError[]> {

  const {data: planned, error: plannedError} = await getPlannedTasks(userID)
  const {data: working, error: workingError} = await getWorkingTasks(userID)
  const {data: completed, error: completedError} = await getCompletedTasks(userID)

  let all: TaskState[] | null = [...planned ?? [], ...working ?? [], ...completed ?? []]
  if (all.length === 0) all = null

  let errors: PostgrestError[] | null = []
  if (plannedError) errors.push(plannedError) // This code sucks
  if (workingError) errors.push(workingError) // This code sucks
  if (completedError) errors.push(completedError) // This code sucks
  if (errors.length === 0) errors = null

  return {data: all, error: errors}

}
