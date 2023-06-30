import { AiFillPauseCircle, AiFillPlayCircle } from "solid-icons/ai"
import { IoCheckmarkCircleOutline } from "solid-icons/io"
import { JSXElement } from "solid-js"
import { CompletedTask } from "./CompletedState"
import { PlannedTask } from "./PlannedState"
import { TaskState } from "./TaskStateInterface"
import { WorkBlock } from "./TimeBlocks"
import { WorkingTask } from "./WorkingState"

export interface StateTransition<T extends TaskState, K extends TaskState> {
  executeTransition: (from: T, onTransition: (newTask: K) => void) => JSXElement | null
  icon: (from: T, to: K) => JSXElement,
  displayName: (from: T, to: K) => string
}

/** Transition between states! */
export const TaskStateMachine = {
  "planned": [
    {
      executeTransition(from, onTransition) {
        // No user info required
        const workingTask = new WorkingTask(from.data, new Date())
        console.log("Planned to working", from, workingTask)

        // Update the database
        // ...

        onTransition(workingTask)
        return null // No popup required
      },
      displayName(from, to) {
        return "Start Task"
      },
      icon(from, to) {
        return <AiFillPlayCircle size={25} />
      },
    } satisfies StateTransition<PlannedTask, WorkingTask>
  ],
  "working": [
    {
      executeTransition(from, onTransition) {
        const workingBlock = new WorkBlock(from.startTime, new Date(), from, true) // Create new work block
        // Update to database somehow?

        if (false) { // check user settings to see if they want to reflect on tasks when they completed them. If true return a popup. 

        }

        const completed = new CompletedTask(from.data)
        onTransition(completed)

        console.log("Working to Completed", from, workingBlock, completed)

        return null
      },
      displayName(from, to) {
        return "Complete Task"
      },
      icon(from, to) {
        return <IoCheckmarkCircleOutline size={25} />
      },
    } satisfies StateTransition<WorkingTask, CompletedTask>,
    {
      executeTransition(from, onTransition) {
          // New block
        const workingBlock = new WorkBlock(from.startTime, new Date(), from, false)

        const planned = new PlannedTask(from.data, 0, from.startTime) // Make a new popup for determining the agenda index
        console.log("Working to Planned", from, workingBlock, planned)
        return null
      },
      icon(from, to) {
          return <AiFillPauseCircle size={25} />
      },
      displayName(from, to) {
          return "Pause Task"
      },
    } satisfies StateTransition<WorkingTask, PlannedTask>
  ]
} as const
