export function changeTaskProp<T extends (keyof UnscheduledTask)>(task: ScheduledTask, prop: T, value: UnscheduledTask[T]) {
  return {
    ...task,
    task: {
      ...task.task,
      task: {
        ...task.task.task,
        [prop]: value
      }
    }
  }
}
