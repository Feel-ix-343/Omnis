// TODO: I will want to fix the accessing of unscheduled task properties

// TODO: Add this to the data base for faster loading? maybe unnecessary

export interface Scheduleable {
  start_time: Date,
  end_time: Date,
  task: UnscheduledTaskWithUrgency
}

export interface ChangeableDuration {
  changed_duration: (amt: number) => Scheduleable
}

export interface Completable {
  task: UnscheduledTaskWithUrgency,
  completed_task: () => CompletedTask
}


export class ScheduledTask implements Scheduleable, ChangeableDuration, Completable {
  public start_time: Date
  public end_time: Date

  constructor(
    public task: UnscheduledTaskWithUrgency,
    public scheduled_datetime: Date,
  ) {
    this.start_time = scheduled_datetime
    this.end_time = new Date(scheduled_datetime.getTime() + task.task.duration * 60 * 1000)
  }

  /** Change the duration in mintues */
  public changed_duration(amt: number): ScheduledTask {
    // TODO: make this not shit
    return new ScheduledTask(
      {
        task: {
          ...this.task.task,
          duration: this.task.task.duration + amt,
        },
        urgency: this.task.urgency,
      },
      this.scheduled_datetime,
    )
  }

  // TODO: make a popup or sumn for this. Take arugments
  public completed_task() {
    return new CompletedTask(
      this.task,
      this.start_time,
      this.end_time
    )
  }

  public started() {
    return new WorkingTask(this.task, new Date())
  }
}

export class WorkingTask implements Scheduleable, ChangeableDuration, Completable {
  public start_time: Date
  public end_time: Date
  constructor(
    public task: UnscheduledTaskWithUrgency,
    public scheduled_datetime: Date,
  ) {
    this.start_time = scheduled_datetime
    this.end_time = new Date(scheduled_datetime.getTime() + task.task.duration * 60 * 1000)
  }

  /** Change the duration in mintues */
  public changed_duration(amt: number): WorkingTask {
    // TODO: make this not shit
    return new WorkingTask(
      {
        task: {
          ...this.task.task,
          duration: this.task.task.duration + amt,
        },
        urgency: this.task.urgency,
      },
      this.scheduled_datetime,
    )
  }

  public stoped() {
    return this.task.task
  }

  // TODO: make a popup or sumn for this. Take arugments
  public completed_task() {
    return new CompletedTask(
      this.task,
      this.start_time,
      new Date()
    )
  }
}

export class CompletedTask implements Scheduleable {
  public end_time: Date
  constructor(
    public task: UnscheduledTaskWithUrgency,
    public start_time: Date,
    public completed_time: Date,
  ) {
    this.end_time = completed_time
  }

  public uncompleted() {
    return this.task.task
  }
}
