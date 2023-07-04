import { AiFillPauseCircle, AiFillPlayCircle } from "solid-icons/ai";
import { IoCheckmarkCircleOutline } from "solid-icons/io";
import { CompletedTask } from "~/model/Tasks/States/CompletedState";
import { PlannedTask } from "~/model/Tasks/States/PlannedState";
import { SchedulableEvent } from "./SchedulableInterfaces";
import { Step } from "../Step";
import { Task } from "../Task";
import { StateTransition } from "../TaskStateMachine";
import { WorkingTask } from "~/model/Tasks/States/WorkingState";

abstract class Block implements SchedulableEvent {
  constructor(
    public blockStart: Date,
    public blockEnd: Date,
    public closedByCompletion: boolean
  ) {

  }

  // Implement schedulable

  startTime: (() => Date) | Date = () => {
    return this.blockStart
  }
  endTime: (() => Date) | Date = () => {
    return this.blockEnd
  }

  abstract name: string | (() => string);
}

class StepBlock extends Block {
  constructor(
    public blockStart: Date,
    public blockEnd: Date,
    public closedByCompletion: boolean,
    public step: Step
  ) {
    super( // TODO: why is this so fking ugly
      blockStart,
      blockEnd,
      closedByCompletion
    )
  }

  name: string | (() => string) = () => {
    return this.step.step.name // TODO: Hate this
  }
}

export class WorkBlock extends Block {

  constructor(
    public blockStart: Date,
    public blockEnd: Date,
    public task: Task, // TODO: Should this be schedulable task?
    public closedByCompletion: boolean,
    public actualAdditionalWorked?: number,
    public plannedAdditionalWorked?: number,
    public actualExtra?: number,
    public plannedExtra?: number,
    public stepBlocks?: StepBlock[]
  ) {
    super(
      blockStart,
      blockEnd,
      closedByCompletion
    )
  }

  name: string | (() => string) = () => {
    return this.task.data.name
  }

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

