import { describe, expect, it } from "vitest";
import { PlannedTask } from "../PlannedState";
import { DBTask } from "../Task";
import { TaskState } from "../TaskStateInterface";
import { basicTask1 } from "./utils";


describe("Test planned task", () => {

  const plannedTask = new PlannedTask(basicTask1, 0, new Date())

  it("initializes with basic mock db task", () => {
    const plannedTask = new PlannedTask(basicTask1, 0, new Date())
    expect(plannedTask.data.name).eq(basicTask1.name)
  })


  it("gives index and other specific fields", () => {
    expect(plannedTask.agendaIndex).eq(0)
  })

  const uiInterface: TaskState = plannedTask

  it("Gives State Name", () => {
    expect(plannedTask.state).eq("planned")
  })
})

