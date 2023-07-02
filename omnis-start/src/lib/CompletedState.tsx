import { IoCheckmarkCircleOutline } from "solid-icons/io";
import { JSXElement } from "solid-js";
import { ArrayElement } from "~/utils/types";
import { supabase } from "./supabaseClient";
import { DBTask, Task } from "./Task";
import { TaskState, TaskStateName } from "./TaskStateInterface";



export async function getDBCompletedTasks(userID: string) {
  return await supabase.from("completed_tasks").select("*, tasks(*)").eq("tasks.user_id", userID)
}
type DBCompletedTask = ArrayElement<NonNullable<Awaited<ReturnType<typeof getDBCompletedTasks>>["data"]>>


export class CompletedTask extends Task implements TaskState {
  constructor(
    public completedData: DBCompletedTask,
  ) {
    super(completedData.tasks!)
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
