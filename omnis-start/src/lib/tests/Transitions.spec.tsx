import { describe, expect, expectTypeOf, it } from "vitest";
import { PlannedTask } from "../PlannedState";
import { TaskState } from "../TaskStateInterface";
import { TaskStateMachine, StateTransition } from "../TaskStateMachine";
import { WorkingTask } from "../WorkingState";
import { basicTask1 } from "./utils";

describe("Planned Task Transitions", () => {
  const plannedTask = new PlannedTask(basicTask1, 0, new Date())
  const transitions = TaskStateMachine[plannedTask.state]

  it("has start-task transition", () => {

    expectTypeOf(transitions[0]).toMatchTypeOf<StateTransition<PlannedTask, WorkingTask>>()

  })

  it("can execute first transition", () => {
    let workingTask: WorkingTask

    const set = (w: WorkingTask) => {
      workingTask = w

      expect(workingTask).not.toBeUndefined()
      expect(workingTask.startTime.toLocaleTimeString()).eq(new Date().toLocaleTimeString())
    }


    transitions[0].executeTransition(plannedTask, set)
  })
})


describe("Working Task Transitions", () => {
  const now = new Date()
  now.setHours(now.getHours() - 1)
  const workingTask = new WorkingTask(basicTask1, now)
  const transitions = TaskStateMachine[workingTask.state]

  it("can execute all transitions", () => {

    console.log("Working Status: ", workingTask.statusText())
    transitions.forEach(t => {

      let newState: TaskState

      const set = (newState: TaskState) => {
        console.log("Transition Name: ", t.displayName(workingTask))
        newState = newState
        console.log("New state name: ", newState.state)
        if (newState.statusText) console.log("New state status: ", newState.statusText())
        else console.log("No status")
      }

      t.executeTransition(workingTask, set)
    })

  })

})
