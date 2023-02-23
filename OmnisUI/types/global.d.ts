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
}

type DBTask = import ("../src/database/database.types").Database["public"]["Tables"]["tasks"]["Row"]



