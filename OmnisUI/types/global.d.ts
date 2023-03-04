type UnscheduledTask = {
  id: string,
  name: string,
  description: string | null,

  /**Duration in minutes */
  duration: number | null,


  importance: "High" | "Low",

  /** Due date of the task. Only the date matters */
  due_date: Date,

  completed: boolean,

  steps: {id: string, duration: number, description: string, completed: boolean, edited: boolean}[] | null
}

type UnscheduledTaskWithUrgency = {
  task: UnscheduledTask,
  urgency: "High" | "Low"
}

type ScheduledTask = {
  task: UnscheduledTaskWithUrgency,
  schedule_datetime: Date
}


// TODO: Algo does not accept tasks without a duration. If duration is null, the task will be considered a daily task. TODO: Make this more clear with types

type DBTask = import ("../src/database/database.types").Database["public"]["Tables"]["tasks"]["Row"]



