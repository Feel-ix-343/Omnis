import { JSXElement } from "solid-js";
import { Lazy } from "~/utils/types";
import { TaskState } from "~/model/Tasks/States/TaskStateInterface";

export interface SchedulableEvent { // For the calendar view
  startTime: Lazy<Date>;
  endTime: Lazy<Date>;
  name: Lazy<string>;
  onOpen?: () => JSXElement
  setStart?: (date: Date) => void;
  setEnd?: (date: Date) => void
  /** Set the duration in miliseconds */
}

export interface SchedulableTaskState extends TaskState { // Everything relevant to the calendar view about task states
  startTime: Lazy<Date>;
  endTime: Lazy<Date>;
  setStart?: (date: Date) => void;
  setEnd?: (date: Date) => void

  // This has to violate OCP
  completed: boolean, 
  played: boolean
}
