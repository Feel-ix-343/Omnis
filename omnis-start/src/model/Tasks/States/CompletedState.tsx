import { PostgrestError } from "@supabase/supabase-js";
import { IoCheckmarkCircleOutline } from "solid-icons/io";
import { JSXElement } from "solid-js";
import { ArrayElement, DataResponse } from "~/utils/types";
import { DBTask, Task } from "../Task";
import { TaskState, TaskStateName } from "./TaskStateInterface";
import { TaskStateMachine } from "../TaskStateMachine";
import { supabase } from "~/lib/supabaseClient";

export async function getCompletedTasks(userID: string): DataResponse<CompletedTask[], PostgrestError> {
  const {data, error} = await getDBCompletedTasks(userID)
  return {data: data?.map(d => new CompletedTask(d)) ?? null, error}
}


async function getDBCompletedTasks(userID: string) {
  return await supabase.from("completed_tasks").select("*, tasks(*)").eq("tasks.user_id", userID)
}
type DBCompletedTask = ArrayElement<NonNullable<Awaited<ReturnType<typeof getDBCompletedTasks>>["data"]>>


export class CompletedTask extends Task implements TaskState {
  constructor(
    public completedData: DBCompletedTask,
  ) {
    super(completedData.tasks!)
  }

  transitions = () => {
    return TaskStateMachine[this.state].map(T => new T(this))
  }

  duration: () => number = () => {
    return 5
  };

  popupDisplay(): JSXElement {
      return <p class="bg-green-50">{this.data.name} is done</p>
  };

  statusIcon = () => <IoCheckmarkCircleOutline />;
  state = "completed" as const;


  // totalDuration() {}
  // totalOver() {}
  // totalExtra() {}

  // getWorkblocks() {}
  // getStepBlocks() {}
}
