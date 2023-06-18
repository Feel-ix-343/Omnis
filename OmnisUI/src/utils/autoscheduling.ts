import { Session } from "@supabase/supabase-js";
import { supabase } from "./database/supabaseClient";
import { ScheduledTask } from "./taskStates";
import z from "zod";

console.log("Prod?", import.meta.env.PROD)
const omnis_algo_addr: string = import.meta.env.VITE_OMNIS_ALGO_ADDR;

const Importance = z.enum(["High", "Low"])
export type Importance = z.infer<typeof Importance>

const UnscheduledTaskValidator = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  duration: z.number(),
  importance: Importance,
  due_date: z.coerce.date(),
  steps: z.array(z.object({
    id: z.string(),
    duration: z.number(),
    description: z.string(),
    completed: z.boolean(),
    edited: z.boolean(),
  })).nullable(),
  start_date: z.coerce.date().nullable(),
  goals: z.array(z.string()).nullable()
})

export type UnscheduledTask = z.infer<typeof UnscheduledTaskValidator>

const UrgencyValidator = z.enum(["High", "Low"])
export type Urgency = z.infer<typeof UrgencyValidator>


const UnscheduledTaskWithUrgencyValidator = z.object({
  task: UnscheduledTaskValidator,
  urgency: UrgencyValidator,
})
export type UnscheduledTaskWithUrgency = z.infer<typeof UnscheduledTaskWithUrgencyValidator>

const ObstacleValidator = z.object({
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
})
export type Obstacle = z.infer<typeof ObstacleValidator>


export async function scheduleTasks(session: Session, tasks: UnscheduledTask[], obstacles?: Obstacle[]): Promise<OmnisError<ScheduledTask[], string>> {
  if (tasks.length === 0) return {data: [], error: ""}

  const {data, error} = await supabase.from("user_settings").select("*").eq("user_id", session.user.id).maybeSingle()

  if (error) {
    console.log(error)
    return {data: null, error: "Error fetching user settings"}
  }

  const start_time = new Date()
  start_time.setHours(data?.start_time ?? 9, 0, 0, 0)

  let end_time = new Date()
  end_time.setHours(data?.end_time ?? 17, 0, 0, 0)

  const autoschedulingRequest = {
    unscheduled_tasks: tasks,
    obstacles: obstacles,
    user_preferences: {
      start_time: start_time.toISOString(),
      end_time: end_time.toISOString()
    }
  }

  let response
  try {
    response = await fetch(
      `${omnis_algo_addr}/autoschedule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(autoschedulingRequest), 
      }
    )
  } catch (error) {
    console.log(error) // TODO: Return error
    return {data: null, error: "Error connecting to the server"}
  }

  const json = await response.json()

  console.log(json)

  const AutoScheduleResponse = z.object({
    message: z.string().nullable(),
    error: z.string().nullable(),
    scheduled_tasks: z.array(
      z.object({
        task: UnscheduledTaskWithUrgencyValidator,
        scheduled_datetime: z.coerce.date(),
      }).transform(val => new ScheduledTask(val.task, val.scheduled_datetime))
    )
  })

  const autoscheduledResponse = AutoScheduleResponse.parse(json)

  if (autoscheduledResponse.message) {
    console.log(autoscheduledResponse.message)
  }

  return {data: autoscheduledResponse.scheduled_tasks, error: autoscheduledResponse.error}
}

export async function testServer() {
  const response = await fetch(
    // `${omnis_algo_addr}/testjson`,
    // {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     name: "Felix"
    //   })
    // }

    `${omnis_algo_addr}/test`

  )
  const data = await response.text()

  console.log(data)

  let headers = new Headers()
  headers.append("Content-Type", "application/json")

  const response2 = await fetch(
    `${omnis_algo_addr}/testjson`,
    {
      method: "POST",
      headers: headers,
      redirect: "follow",
      body: JSON.stringify({
        name: "Felix"
      })
    }
  )
  const data2 = await response2.text()

  console.log(data2)

}
