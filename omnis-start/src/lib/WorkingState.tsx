import { PostgrestError } from "@supabase/supabase-js";
import { AiFillPlayCircle } from "solid-icons/ai";
import { JSXElement } from "solid-js";
import { ArrayElement, DataResponse, Lazy } from "~/utils/types";
import { Step } from "./Step";
import { DBTask, Task } from "./Task";
import { StateStatus, TaskState, TaskStateName } from "./TaskStateInterface";
import { supabase } from "./supabaseClient";
import { TaskStateMachine } from "./TaskStateMachine";

export async function getWorkingTasks(userID: string): DataResponse<WorkingTask[], PostgrestError> {
  const {data, error} = await getDBWorkingTasks(userID)
  return {data: data?.map(d => new WorkingTask(d)) ?? null, error}
}

async function getDBWorkingTasks(userID: string) {
  return await supabase.from("working_tasks").select("*, tasks(*)").eq("tasks.user_id", userID)
}

type DBWorkingTask = ArrayElement<NonNullable<Awaited<ReturnType<typeof getDBWorkingTasks>>["data"]>>

export class WorkingTask extends Task implements TaskState {// , SchedulableTaskState {
  readonly played: boolean = true;
  readonly completed: boolean = false;

  transitions = () => {
    return TaskStateMachine[this.state].map(T => new T(this))
  }

  test = () => {
    this.transitions()[0].executeTransition((a) => ({b: a.data}))
  }

  constructor( public workingData: DBWorkingTask,) { super(workingData.tasks!) }

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
  state = "working" as const satisfies TaskStateName
  duration: () => number = () => {
    return 5
  }
  setDuration: (d: number) => DataResponse<TaskState, PostgrestError> = async (d) => {
    return {
      data: null,
      error: null
    }
  }
  actionDate: Lazy<Date> = () => new Date(this.workingData.start)
  startTime = () => new Date(this.workingData.start)
  statusIcon = () => <AiFillPlayCircle size={25} />;
  statusText = () =>  ({name: `Working since ${this.startTime().toLocaleTimeString()}`});
  popupDisplay(): JSXElement {
      return <p>Working since {this.startTime().toTimeString()}</p>
  }


}
