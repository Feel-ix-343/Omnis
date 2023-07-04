import { describe, expect, it } from "vitest";
import { TaskState } from "~/model/Tasks/States/TaskStateInterface";
import { WorkingTask } from "~/model/Tasks/States/WorkingState";
import { basicTask2 } from "./utils";

describe("Tests working tasks", () => {
  const workingTask = new WorkingTask({tasks: basicTask2, start: new Date().toString(), task_id: basicTask2.id})

  it("Initializes", () => {
    expect(workingTask.data.name).eq(basicTask2.name)
  })


  const state: TaskState = workingTask

  it("Interface Tells Action Date", () => {
    const today = new Date().toDateString()
    expect(state.actionDate!().toDateString()).eq(today)
  })

  it("Interface Gives status", () => {
    const status = state.statusText
    expect(status).not.toBeUndefined()
  })
})
