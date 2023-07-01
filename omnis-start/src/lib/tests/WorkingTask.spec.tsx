import { describe, expect, it } from "vitest";
import { TaskState } from "../TaskStateInterface";
import { WorkingTask } from "../WorkingState";
import { basicTask2 } from "./utils";

describe("Tests working tasks", () => {
  const workingTask = new WorkingTask(basicTask2, new Date())

  it("Initializes", () => {
    expect(workingTask.name).eq(basicTask2.name)
  })


  const state: TaskState = workingTask

  it("Interface Tells Action Date", () => {
    const today = new Date().toDateString()
    expect(state.actionDate().toDateString()).eq(today)
  })

  it("Interface Gives status", () => {
    const status = state.statusText
    expect(status).not.toBeUndefined()
  })
})
