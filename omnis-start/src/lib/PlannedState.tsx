import { PostgrestError } from "@supabase/supabase-js"
import { AiFillPauseCircle } from "solid-icons/ai"
import { JSX, JSXElement } from "solid-js"
import { z } from "zod"
import { DataResponse } from "~/utils/types"
import { DBTask, Task } from "./Task"
import { TaskState, TaskStateName } from "./TaskStateInterface"

export class PlannedTask extends Task implements TaskState {
  public state =  "planned" as const satisfies TaskStateName 
  constructor (
    public data: DBTask,
    public agendaIndex: number,
    public scheudledDate: Date, // I just want this to be used as a date though. 
  ) {
    super(data)
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
    return this.scheudledDate
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
