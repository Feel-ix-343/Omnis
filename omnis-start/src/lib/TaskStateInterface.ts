import { PostgrestError } from "@supabase/supabase-js"
import { JSXElement } from "solid-js"
import { DataResponse, MaybeLazy } from "~/utils/types"
import { DBTask } from "./Task"

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

export type StateStatus = MaybeLazy<{name: string, description?: string}>

