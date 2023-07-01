import { IoCheckmarkCircleOutline } from "solid-icons/io";
import { JSXElement } from "solid-js";
import { DBTask, Task } from "./Task";
import { TaskState, TaskStateName } from "./TaskStateInterface";

export class CompletedTask extends Task implements TaskState {
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

  popupDisplay(): JSXElement {
      return <p class="bg-green-50">{this.data.name} is done</p>
  };

  statusIcon = () => <IoCheckmarkCircleOutline />;
  state: TaskStateName = "completed" as const satisfies TaskStateName;


  // totalDuration() {}
  // totalOver() {}
  // totalExtra() {}

  // getWorkblocks() {}
  // getStepBlocks() {}
}
