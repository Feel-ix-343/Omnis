import { describe, expect, it } from "vitest";
import { getAllTasks } from "../getState";

describe("Task works", () => {
  it("produces a duration", async () => {

    //const user_id = (await useSession()).user.id
    const user_id = "8122fefc-8817-4db7-bb91-5bc7f2116f7d"

    const {data: tasks, error} = await getAllTasks(user_id)

    expect(error).toBe(null)

    tasks!.forEach(t => t.getDuration())
  })

})
