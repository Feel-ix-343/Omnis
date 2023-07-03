import { PostgrestError } from "@supabase/supabase-js"
import { AiFillPauseCircle } from "solid-icons/ai"
import { JSX, JSXElement } from "solid-js"
import { z } from "zod"
import { ArrayElement, DataResponse } from "~/utils/types"
import { supabase } from "./supabaseClient"
import { DBTask, Task } from "./Task"
import { TaskState, TaskStateName } from "./TaskStateInterface"
import { StateTransition, TaskStateMachine } from "./TaskStateMachine"

export async function getDBPlannedTasks(userID: string) {
  return await supabase.from("planned_tasks").select("*, tasks(*)").eq("tasks.user_id", userID)
}

type DBPlannedTask = ArrayElement< NonNullable< Awaited<ReturnType<typeof getDBPlannedTasks>>["data"]>>

export class PlannedTask extends Task implements TaskState {
  public state =  "planned" as const satisfies TaskStateName 
  constructor ( public plannedData: DBPlannedTask,) { super(plannedData.tasks!) } // It should not ever be null }

  transitions = () => {
    return TaskStateMachine[this.state].map(T => new T(this))
  }

  completed: boolean = false
  played: boolean = false


  duration: () => number = () => {
    const pgduration = intervalToMinutes(this.data.duration)
    if (!pgduration) return 15 // Default task length
    return pgduration
  }

  setDuration: (d: number) => DataResponse<TaskState, PostgrestError> = async (d: number) => {
    return {
      data: null,
      error: null
    }
  } // Do this

  statusIcon = () => <AiFillPauseCircle size={25} />
  actionDate = () => {
    return new Date(this.plannedData.scheduled_date)
  }
}
const intervalToMinutes = (interval: unknown) => {
  const zodInterval = z.object({
    hours: z.number().nullish(),
    minutes: z.number().nullish(),
    seconds: z.number().nullish()
  }).nullable()
  const pgduration = zodInterval.parse(interval)
  if (!pgduration) return null

  let minutes: number = 0;
  if (pgduration.hours) minutes += pgduration.hours * 60
  if (pgduration.minutes) minutes += pgduration.minutes;
  if (pgduration.seconds) minutes += pgduration.seconds / 60

  return minutes
}

const minutesToInterval = (minutes: number)  => {
  const data = {
    hours: 0
  }
  return JSON.stringify(data)
}
