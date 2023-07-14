import { describe, expect, it } from "vitest"
import { getPlannedTasks, PlannedTask } from "../Tasks/States/PlannedState"
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


describe("Test planned tasks from DB", async () => {

  const {data: plannedTasks, error} = await getPlannedTasks("8122fefc-8817-4db7-bb91-5bc7f2116f7d")

  it("loads", () => {
    expect(error).toBe(null)
    expect(plannedTasks).not.toBe(null)
  })

  it("produces durations", () => {
    plannedTasks!.forEach(t => t.getDuration())
  })

})

