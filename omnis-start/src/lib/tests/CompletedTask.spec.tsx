
import { describe, expect, it } from "vitest";
import { CompletedTask } from "../CompletedState";
import { WorkingTask } from "../WorkingState";
import { basicTask2 } from "./utils";

describe("Tests completed tasks", () => {
  const completedTask = new CompletedTask({
    tasks: basicTask2,
    reflection: "It was very fun",
    realized_estimation_score: null,
    realized_importance_score: null,
    realized_pride_score: null,
    realized_urgency_score: null,
    task_id: basicTask2.id
  })

  it("Initializes", () => {
    expect(completedTask.data.name).eq(basicTask2.name)
  })

  it("Records reflection", () => {
    expect(completedTask.completedData.reflection).eq("It was very fun")
  })
})
