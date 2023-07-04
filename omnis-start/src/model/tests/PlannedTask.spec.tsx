import { describe, expect, it } from "vitest"
import { PlannedTask } from "../Tasks/States/PlannedState"
import { basicTask1 } from "./utils"


describe("Test planned task", () => {

  const plannedTask = new PlannedTask({tasks: basicTask1, daily_agenda_index: 0, scheduled_date: new Date().toString(), task_id: basicTask1.id})

  it("gives index and other specific fields", () => {
    expect(plannedTask.plannedData.daily_agenda_index).eq(0)
  })

  const uiInterface: TaskState = plannedTask

  it("Gives State Name", () => {
    expect(plannedTask.state).eq("planned")
  })
})

