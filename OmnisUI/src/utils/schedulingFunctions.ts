import { Session } from "@supabase/supabase-js";
import { newNotification } from "../App";
import { supabase } from "./database/supabaseClient";
import { ScheduledTask } from "./taskStates";
import Notification from "../components/Notification";

console.log("Prod?", import.meta.env.PROD)
const omnis_algo_addr: string = import.meta.env.PROD ? import.meta.env.VITE_OMNIS_ALGO_ADDR_PROD : import.meta.env.VITE_OMNIS_ALGO_ADDR;


export async function scheduleTasks(tasks: UnscheduledTask[], obstacles?: Obstacle[], session: Session): Promise<OmnisError<ScheduledTask[], string>> {
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
  const autoscheduledResponse = {
    message: json.message,
    error: json.error,
    scheduled_tasks: json.scheduled_tasks?.map(obj => {
      // NOTE: The start date will be changed
      return new ScheduledTask(
        {
          ...obj.task,
          task: {
            ...obj.task.task,
            due_date: new Date(obj.task.task.due_date),
            start_date: new Date(obj.task.task.start_date)
          },
        },
        new Date(obj.scheduled_datetime),
      )
    })
  }

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
