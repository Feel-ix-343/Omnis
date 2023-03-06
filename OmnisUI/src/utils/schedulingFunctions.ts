console.log("Prod?", import.meta.env.PROD)
const omnis_algo_addr: string = import.meta.env.PROD ? import.meta.env.VITE_OMNIS_ALGO_ADDR_PROD : import.meta.env.VITE_OMNIS_ALGO_ADDR;


export async function scheduleTasks(tasks: UnscheduledTask[]) {
  const autoschedulingRequest = {
    unscheduled_tasks: tasks,
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
    return {
      task: {
        ...obj.task,
        task: {
          ...obj.task.task,
          due_date: new Date(obj.task.task.due_date),
        },
      },
      scheduled_datetime: new Date(obj.scheduled_datetime),
    } 
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