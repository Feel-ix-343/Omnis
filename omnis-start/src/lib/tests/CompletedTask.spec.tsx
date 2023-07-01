
import { describe, expect, it } from "vitest";
import { CompletedTask } from "../CompletedState";
import { WorkingTask } from "../WorkingState";
import { basicTask2 } from "./utils";

describe("Tests completed tasks", () => {
  const completedTask = new CompletedTask(basicTask2, "It was very fun")

  it("Initializes", () => {
    expect(completedTask.data.name).eq(basicTask2.name)
  })

  it("Records reflection", () => {
    expect(completedTask.reflection).eq("It was very fun")
  })
})
