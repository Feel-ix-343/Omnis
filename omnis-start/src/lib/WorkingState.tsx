import { PostgrestError } from "@supabase/supabase-js";
import { AiFillPlayCircle } from "solid-icons/ai";
import { JSXElement } from "solid-js";
import { DataResponse, Lazy } from "~/utils/types";
import { Step } from "./Step";
import { DBTask, Task } from "./Task";
import { StateStatus, TaskState, TaskStateName } from "./TaskStateInterface";

export class WorkingTask extends Task implements TaskState {// , SchedulableTaskState {
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
  actionDate: Lazy<Date> = () => this.startTime
  statusIcon = () => <AiFillPlayCircle size={25} />;
  statusText = () =>  ({name: `Working since ${this.startTime.toLocaleTimeString()}`});
  popupDisplay(): JSXElement {
      return <p>Working since {this.startTime.toTimeString()}</p>
  }


}
