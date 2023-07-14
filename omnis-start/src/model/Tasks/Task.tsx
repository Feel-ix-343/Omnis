import { JSXElement } from "solid-js"
import { z } from "zod"
import { supabase } from "~/lib/supabaseClient"


export class Task { // This gets passed to the basic list view at the start of planning
  constructor( public data: DBTask) {}

  popupDisplay(): JSXElement {
    return <p>TEST TEST</p>
  } 

  getDueDate() {
    if (this.data.due_date) return new Date(this.data.due_date)
    else return null
  }

  getUrgency() {
    if (this.data.user_urgency) return this.data.user_urgency
    //else if (this.data.urgen)i TODO handle algo urgency
    else return null
  }


  getDuration() {
    if (this.data.duration === null) return null

    let minutes = 0;

    const duration = this.data.duration as string
    minutes += parseInt(duration.slice(0, 2)) * 60
    minutes += parseInt(duration.slice(3, 5))
    minutes += parseInt(duration.slice(6, 8)) / 60

    return minutes

    console.log(this.data.duration)

    const pgduration = intervalToMinutes(this.data.duration)
    if (!pgduration) return 15 // Default task length
    return pgduration
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

const tasksQuery = async (id: string) => {
  const {data, error} = await supabase.from("tasks").select("*").eq("user_id", id)
  return data
}

export type DBTask = NonNullable<Awaited<ReturnType<typeof tasksQuery>>>[0]
