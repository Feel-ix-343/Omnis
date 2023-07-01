import { AiFillPauseCircle, AiFillPlayCircle } from "solid-icons/ai"
import { IoCheckmarkCircleOutline, IoCheckmarkDone } from "solid-icons/io"
import { JSXElement } from "solid-js"
import { CompletedTask } from "./CompletedState"
import { PlannedTask } from "./PlannedState"
import { TaskState } from "./TaskStateInterface"
import { WorkBlock } from "./TimeBlocks"
import { WorkingTask } from "./WorkingState"

export interface StateTransition<T extends TaskState, K extends TaskState> {
  executeTransition: (from: T, onTransition: (newTask: K) => void) => JSXElement | null
  icon: (from: T) => JSXElement,
  displayName: (from: T) => string
}

/** Transition between states! */
export const TaskStateMachine = {
  "planned": [
    {
      executeTransition(from, onTransition) {
        // No user info required
        const workingTask = new WorkingTask(from.data, new Date())

        // Update the database
        // ...

        onTransition(workingTask)
        return null // No popup required
      },
      displayName(from) {
        return "Start Task"
      },
      icon(from) {
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


        return null
      },
      displayName(from) {
        return "Complete Task"
      },
      icon(from) {
        return <IoCheckmarkCircleOutline size={25} />
      },
    } satisfies StateTransition<WorkingTask, CompletedTask>,
    {
      executeTransition(from, onTransition) {
          // New block
        const workingBlock = new WorkBlock(from.startTime, new Date(), from, false)

        const planned = new PlannedTask(from.data, 0, from.startTime) // Make a new popup for determining the agenda index
        onTransition(planned)
        return null
      },
      icon(from) {
          return <AiFillPauseCircle size={25} />
      },
      displayName(from) {
          return "Pause Task"
      },
    } satisfies StateTransition<WorkingTask, PlannedTask>
  ],
  "completed": [
    {
      executeTransition(from, onTransition) {
        onTransition(new PlannedTask(from.data, 0, new Date()))
        return null
      },
      displayName(from) {
          return "Uncomplete task"
      },
      icon(from) {
        return <IoCheckmarkDone />;
      },
    } satisfies StateTransition<CompletedTask, PlannedTask>
  ]
} as const
