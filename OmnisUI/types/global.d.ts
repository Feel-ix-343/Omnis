type Importance = "High" | "Low"


// TODO: Add a start date propr
type UnscheduledTask = {
  id: string,
  name: string,
  description: string | null,

  /**Duration in minutes */
  duration: number, // TODO: Duration should have a daily type


  importance: Importance

  /** Due date of the task. Only the date matters */
  due_date: Date,

  steps: {id: string, duration: number, description: string, completed: boolean, edited: boolean}[] | null
}

type Urgency = "High" | "Low"


// TODO: this is uncessary for the UI. Refactor
type UnscheduledTaskWithUrgency = {
  task: UnscheduledTask,
  urgency: Urgency,
}

// Another scheudling algo type
type Obstacle = {
  start_time: Date,
  end_time: Date
}



// TODO: Algo does not accept tasks without a duration. If duration is null, the task will be considered a daily task. TODO: Make this more clear with types

type DBTask = import ("../src/utils/database/database.types").Database["public"]["Tables"]["tasks"]["Row"]



