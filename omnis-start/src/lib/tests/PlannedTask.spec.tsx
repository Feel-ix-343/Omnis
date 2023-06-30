import { describe, it } from "vitest";
import { PlannedTask } from "../PlannedState";
import { DBTask } from "../Task";
import { basicTask1 } from "./utils";


describe("Test the methods and the task interface for planned task state", () => {
  it("initializes with basic mock db task", () => {
    const plannedTask = new PlannedTask(basicTask1, 0, new Date())
    console.log(plannedTask)
  })
})
