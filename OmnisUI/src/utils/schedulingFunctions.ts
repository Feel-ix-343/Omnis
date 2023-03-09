import { Session } from "@supabase/supabase-js";
import { newNotification } from "../App";
import { supabase } from "./database/supabaseClient";
import { ScheduledTask } from "./taskStates";
import Notification from "../components/Notification";

console.log("Prod?", import.meta.env.PROD)
const omnis_algo_addr: string = import.meta.env.PROD ? import.meta.env.VITE_OMNIS_ALGO_ADDR_PROD : import.meta.env.VITE_OMNIS_ALGO_ADDR;


export async function scheduleTasks(tasks: UnscheduledTask[], obstacles?: Obstacle[], session: Session) {
  if (tasks.length === 0) return

  const {data, error} = await supabase.from("user_settings").select("*").eq("user_id", session.user.id).maybeSingle()

  if (error) {
    console.log(error)
    return
  }

  const start_time = new Date()
  start_time.setHours(data?.start_time ?? 9, 0, 0, 0)

  let end_time = new Date()
  end_time.setHours(data?.end_time ?? 17, 0, 0, 0)

  console.log("Scheduling", tasks, obstacles)
  const autoschedulingRequest = {
    unscheduled_tasks: tasks,
    obstacles: obstacles,
    user_preferences: {
      start_time: start_time.toISOString(),
      end_time: end_time.toISOString()
    }
  }

  const response = await fetch(
    `${omnis_algo_addr}/autoschedule`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(autoschedulingRequest),
    }
  )

  const json = await response.json()

  console.log(json)
  const scheduledTasks: ScheduledTask[] = json.map(obj => {
    return new ScheduledTask(
      {
        ...obj.task,
        task: {
          ...obj.task.task,
          due_date: new Date(obj.task.task.due_date),
        },
      },
      new Date(obj.scheduled_datetime),
    )
  })

  console.log(scheduledTasks)


  return scheduledTasks
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
