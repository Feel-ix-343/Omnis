type Task = {
  id: string,
  name: string,
  /** Date. Should not have hours, just the date */
  date: Date,
  time: number | null,
  duration: number | null,
  completed: boolean,
  priority: number,
  description: string | null,
  steps: {id: string, duration: number, description: string, completed: boolean, edited: boolean}[] | null
}

type DBTask = import ("../src/database/database.types").Database["public"]["Tables"]["tasks"]["Row"]



