import { describe, expect, it } from "vitest";
import { getTasksWithState } from "../getState";
import { TaskState } from "~/lib/Tasks/States/TaskStateInterface";

describe("Get state", () => {
  it("works to get all tasks from DB", async () => {

    const {data, error} = await getTasksWithState("8122fefc-8817-4db7-bb91-5bc7f2116f7d")
    expect(data).not.toBeNull()
    expect(error).toBeNull()
    console.log("Data", data?.map(d => d.state))



  })

  it("transitions", async () => {
    const {data, error} = await getTasksWithState("8122fefc-8817-4db7-bb91-5bc7f2116f7d")
    expect(data).not.toBeNull()
    expect(error).toBeNull()
    data?.flatMap(d => d.transitions().map(t => [d, t] as const) ).forEach(p => {
      const [d, t] = p

      const set = (newTask: TaskState) => {
        console.log({"Task name": d.data.name, "Transition name": t.displayName(), "Old State": d.state, "New Task State": newTask.state})
      }

      t.executeTransition(set)

    })

  })
})
