import { JSXElement } from "solid-js";
import { MaybeLazy } from "~/utils/types";
import { TaskState } from "./TaskStateInterface";

export interface SchedulableEvent { // For the calendar view
  startTime: MaybeLazy<Date>;
  endTime: MaybeLazy<Date>;
  name: MaybeLazy<string>;
  onOpen?: () => JSXElement
  setStart?: (date: Date) => void;
  setEnd?: (date: Date) => void
  /** Set the duration in miliseconds */
}

export interface SchedulableTaskState extends TaskState { // Everything relevant to the calendar view about task states
  startTime: MaybeLazy<Date>;
  endTime: MaybeLazy<Date>;
  setStart?: (date: Date) => void;
  setEnd?: (date: Date) => void

  // This has to violate OCP
  completed: boolean, 
  played: boolean
}
