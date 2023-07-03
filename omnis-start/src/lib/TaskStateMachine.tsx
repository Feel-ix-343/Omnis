import { AiFillPauseCircle, AiFillPlayCircle } from "solid-icons/ai"
import { IoCheckmarkCircleOutline, IoCheckmarkDone } from "solid-icons/io"
import { JSX, JSXElement } from "solid-js"
import { CompletedTask } from "./CompletedState"
import { PlannedTask } from "./PlannedState"
import { TaskState } from "./TaskStateInterface"
import { WorkBlock } from "./TimeBlocks"
import { WorkingTask } from "./WorkingState"

export interface StateTransition {
  executeTransition: (onTransition: (newTask: TaskState) => void) => JSXElement | null
  icon: () => JSXElement
  displayName: () => string
}


export const TaskStateMachine = {
  "planned":  [
    class PlannedToWorking implements StateTransition {
      constructor(public from: PlannedTask) {}
      executeTransition = (onTransition: (newTask: TaskState) => void): JSXElement => {

        // No user info required
        const workingTask = new WorkingTask({tasks: this.from.data, start: new Date().toString(), task_id: this.from.data.id})

        // Update the database
        // ...

        onTransition(workingTask)
        return null // No popup required
      }
      displayName() {
        return "Start Task"
      }
      icon() {
        return <AiFillPlayCircle size={25} />
      }
    }

  ],
  "working": [
    class WorkingToCompleted implements StateTransition {
      constructor (public from: WorkingTask) {}
      executeTransition = (onTransition: (newTask: TaskState) => void): JSXElement => {
        const workingBlock = new WorkBlock(this.from.startTime(), new Date(), this.from, true) // Create new work block
        // Update to database somehow?
        if (false) { // check user settings to see if they want to reflect on tasks when they completed them. If true return a popup. 

        }
        const completed = new CompletedTask({
          tasks: this.from.data,
          task_id: this.from.data.id, 
          reflection: null,
          realized_urgency_score: null,
          realized_pride_score: null,
          realized_importance_score: null,
          realized_estimation_score: null
        })
        onTransition(completed)
        return null
      }
      displayName() {
        return "Complete Task"
      }
      icon() {
        return <IoCheckmarkCircleOutline size={25} />
      }
    },
    class WorkingToPlanned implements StateTransition {

      constructor (public from: WorkingTask) {}

      executeTransition = (onTransition: (newTask: TaskState) => void): JSXElement => {
        // New block
        const workingBlock = new WorkBlock(this.from.startTime(), new Date(), this.from, false)

        const planned = new PlannedTask({tasks: this.from.data, daily_agenda_index: 0, scheduled_date: this.from.startTime().toString(), task_id: this.from.data.id}) // Make a new popup for determining the agenda index
        onTransition(planned)
        return null
      }
      icon() {
        return <AiFillPauseCircle size={25} />
      }
      displayName() {
        return "Pause Task"
      }
    }
  ],
  "completed": [
    class CompletedToPlanned implements StateTransition {
      constructor (public from: CompletedTask) {}
      executeTransition = (onTransition: (newTask: TaskState) => void): JSXElement => {
        onTransition(new PlannedTask({tasks: this.from.data, daily_agenda_index: 0, scheduled_date: new Date().toString(), task_id: this.from.data.id}))
        return null
      }
      displayName() {
        return "Uncomplete task"
      }
      icon() {
        return <IoCheckmarkDone />;
      }
    }
  ]
} as const
