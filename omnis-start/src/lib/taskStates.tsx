import { PostgrestError, Session } from "@supabase/supabase-js";
import { JSX, JSXElement } from "solid-js";
import { DataResponse, MaybeLazy } from "~/utils/types";
import { Database } from "../../../supabase/database.types";
import { supabase } from "./supabaseClient";
import {z } from 'zod'
import { AiFillPauseCircle, AiFillPlayCircle } from "solid-icons/ai";
import { IoCheckmarkCircleOutline } from "solid-icons/io";


/**

*/



const tasksQuery = async (id: string) => {
  const {data, error} = await supabase.from("tasks").select("*").eq("user_id", id)
  return data
}

type DBTask = NonNullable<Awaited<ReturnType<typeof tasksQuery>>>[0]


class Task { // This gets passed to the basic list view at the start of planning
  constructor(
    public data: DBTask
  ) {}


  popupDisplay(): JSXElement {
    return <p>TEST TEST</p>
  } 
}

// the thing is that this is a task that all other states could be viewed as. It is almost like a parent to all other states. However the children would overload som eo

// But should it implement state? Ill just go with no for now. It will probably make more sense later

type StateStatus = MaybeLazy<{name: string, description?: string}>

// But what about transitions? If I put transitions in this, then say I add an archived state (this is likely because of the state pattern I have already identified), then I would have to add a to archived transition in this interface, and then I would have to update code from all of the classes that transition there. Well I going to have to write the code anyway but it would be simpler if I didn't have to modify my old classes. Would it though? What would change after you add an onArchived? On the model you would add a new state class (Good), add new onArchived methods in relevant existing state classes(bad), and update the UI to display the new transition button(bad). However, I don't even know how I would make popups for the transitions with parameters and stuff in this, maybe it is just too complicated. OR you could make state transition classes for each transition type with their own buttons, transition popups (when necessary), and transition logic (like current time for start working class). But how would the UI know which ones are related to each *state* interface? Couldn't it just be an array on the state interface? No because this breaks OCP again. Could it be a map or something? Maybe but then I would need to have enum identifiers for each state. Is this bad? how would it work? So make an enum of all states. There will be a map of each state to a list of the transitions. The UI will display each of these transitions.  Lets just not worry about transitions for now and try to get this shit rendered, then implement states later. 



type TaskStateName = "planned" | "working" | "completed" // This code breaks OCP but its fine
interface TaskState { // This is what gets passed to the daily goal view. It is all task information and state transition information without a calendar display. It is everything that at least the daily goal view would want to do and at most the calendar view. 

  data: DBTask, // This gives name, description, ...

  /** Task popup component that will have specific information depending on state */
  popupDisplay: (onUpdate: (state: TaskState) => void) => JSXElement 

  /** Duration of the task in minutes */
  duration: () => number
  setDuration?: (d: number) => DataResponse<TaskState, PostgrestError>

  // Most task states have specific action dates. Planned are auto scheduled, working is just working, completed is stored in the past
  actionDate?: MaybeLazy<Date>

  // State Transitions. Also, when necessary, say when moving a task to completed, the user needs to enter in a reflection on the task. Transition-to-state event -> specific-to-new state ui popup -> transition to new state or no transition.

  // onNextState?: StateTransition
  // onPreviousState?: StateTransition
  // onPlanned?: StateTransition 
  // onStart?: StateTransition
  // onCompleted?: StateTransition

  statusText?: StateStatus
  statusIcon: JSXElement, // Replace with some more classy type thing. 
  state: TaskStateName
}


interface SchedulableTaskState extends TaskState { // Everything relevant to the calendar view about task states
  startTime: MaybeLazy<Date>;
  endTime: MaybeLazy<Date>;
  setStart?: (date: Date) => void;
  setEnd?: (date: Date) => void

  // This has to violate OCP
  completed: boolean, 
  played: boolean
}



interface StateTransition<T extends TaskState, K extends TaskState> {
  executeTransition: (from: T, onTransition: (newTask: K) => void) => JSXElement | null
  icon: (from: T, to: K) => JSXElement,
  displayName: (from: T, to: K) => string
}



const intervalToMinutes = (interval: unknown) => {
  const zodInterval = z.object({
    hours: z.number().nullish(),
    minutes: z.number().nullish(),
    seconds: z.number().nullish()
  }).nullable()
  const pgduration = zodInterval.parse(interval)
  if (!pgduration) return null

  let minutes: number = 0;
  if (pgduration.hours) minutes += pgduration.hours * 60
  if (pgduration.minutes) minutes += pgduration.minutes;
  if (pgduration.seconds) minutes += pgduration.seconds / 60

  return minutes
}

const minutesToInterval = (minutes: number)  => {
  const data = {
    hours: 0
  }
  return JSON.stringify(data)
}

// TODO: Do you need to implement both of them if they extend each other? The planning view will only get the non schedulable one (I think). 

// TODO: Figure out how to schedule this thang.
class PlannedTask extends Task implements TaskState {
  public state: TaskStateName = "planned"
  constructor (
    public data: DBTask,
    public agendaIndex: number,
    public scheudledDate: Date, // I just want this to be used as a date though. 
  ) {
    super(data)
  }

  completed: boolean = false
  played: boolean = false


  duration: () => number = () => {
    const pgduration = intervalToMinutes(this.data.duration)
    if (!pgduration) return 15 // Default task length
    return pgduration
  }

  setDuration: (d: number) => DataResponse<TaskState, PostgrestError> = async (d: number) => {
    return {
      data: this,
      error: null
    }
  } // Do this

  statusIcon: JSX.Element = <AiFillPauseCircle size={25} />
  actionDate = () => {
    return this.scheudledDate
  }
}

class WorkingTask extends Task implements TaskState {// , SchedulableTaskState {
  readonly name: string = this.data.name
  readonly played: boolean = true;
  readonly completed: boolean = false;

  constructor(
    public data: DBTask,
    public startTime: Date,
    public workingStep?: Step,
    public workingStepStart?: Date
  ) {
    super(data)
  }

  // /** Duration of the task in miliseconds */
  totalDuration(): number {
    return 5
  } // Will get pushed back if user goes over time.
  // totalTimeWorked() {}

  // workingStepTotalDuration() {}
  // workingStepTimeWorked() {}

  // taskHistory() {}



  // // Over time timer
  // extraRemaining(){}
  // // Additional (over step) countdown
  // additionalRemaining() {}
  // currentWorkingStepRemaining() {}


  // endTime: Date | (() => Date) = () => {
  //   let date = new Date(this.startTime)
  //   date.setTime(date.getTime() + this.totalDuration()) // Does this even work?
  //   return date
  // }

  // setEnd?: ((date: Date) => void) | undefined; // todo: dodoooo it
  state: TaskStateName = "working";
  duration: () => number = () => {
    return 5
  }
  setDuration: (d: number) => DataResponse<TaskState, PostgrestError> = async (d) => {
    return {
      data: null,
      error: null
    }
  }
  actionDate: MaybeLazy<Date> = () => this.startTime
  statusIcon: JSX.Element = <AiFillPlayCircle size={25} />;
  statusText?: StateStatus | undefined = () =>  ({name: `Working since ${this.startTime.toTimeString()}`});
  popupDisplay(): JSX.Element {
      return <p>Working since {this.startTime.toTimeString()}</p>
  }


}


class CompletedTask extends Task implements TaskState {
  constructor(
    public data: DBTask,
    public reflection?: string,
    public realizedImportance?: number,
    public realizedUrgency?: number,
    public realizedEstimationScore?: number,
    public realizedPrideScore?: number,
  ) {
    super(data)
  }

  duration: () => number = () => {
    return 5
  };

  popupDisplay(): JSX.Element {
      return <p class="bg-green-50">{this.data.name} is done</p>
  };

  statusIcon: JSX.Element = <IoCheckmarkCircleOutline />;
  state: TaskStateName = "completed";


  // totalDuration() {}
  // totalOver() {}
  // totalExtra() {}

  // getWorkblocks() {}
  // getStepBlocks() {}
}

class Step {
  constructor (
    public step: Database["public"]['Tables']['steps']['Row'] // TODO: update this to the query return type
  ) {}
}

// What file should this go in? Should it go in the view-model files?
interface SchedulableEvent { // For the calendar view
  startTime: MaybeLazy<Date>;
  endTime: MaybeLazy<Date>;
  name: MaybeLazy<string>;
  onOpen?: () => JSXElement
  setStart?: (date: Date) => void;
  setEnd?: (date: Date) => void
  /** Set the duration in miliseconds */
}

// TODO: Handle reactivity when changing this. 

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

class WorkBlock extends Block {

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

