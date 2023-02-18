
export type Task = {
  id: string,
  name: string,
  date: Date,
  time: number | null,
  duration: number | null,
  completed: boolean,
  priority: number,
  description: string
}

