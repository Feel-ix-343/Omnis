import { describe, expect, expectTypeOf, it } from "vitest";
import { CompletedTask } from "../CompletedState";
import { PlannedTask } from "../PlannedState";
import { TaskState } from "../TaskStateInterface";
import { TaskStateMachine, StateTransition } from "../TaskStateMachine";
import { WorkingTask } from "../WorkingState";
import { basicTask1 } from "./utils";

describe("Planned Task Transitions", () => {
  const plannedTask = new PlannedTask({tasks: basicTask1, daily_agenda_index: 0, scheduled_date: new Date().toString(), task_id: basicTask1.id})
  const transitions = TaskStateMachine[plannedTask.state]

  it("can execute first transition", () => {
    let workingTask: TaskState

    const set = (w: TaskState) => {
      workingTask = w

      expect(workingTask).not.toBeUndefined()
    }


    plannedTask.transitions()[0].executeTransition(set)
  })

  it("can execute all transitions", () => {

    plannedTask.transitions().forEach(t => {

      let newStateS: TaskState

      const set = (newState: TaskState) => {
        console.log("Transition Name: ", t.displayName())
        newStateS = newState
        console.log("New state name: ", newState.state)
        if (newState.statusText) console.log("New state status: ", newState.statusText())
        else console.log("No status")
      }

      t.executeTransition(set)
    })


  })
})


describe("Working Task Transitions", () => {
  const now = new Date()
  now.setHours(now.getHours() - 1)
  const workingTask = new WorkingTask({tasks: basicTask1, start: now.toString(), task_id: basicTask1.id})
  const transitions = workingTask.transitions()

  it("can execute all transitions", () => {

    console.log("Working Status: ", workingTask.statusText())
    transitions.forEach(t => {

      let newStateS: TaskState

      const set = (newState: TaskState) => {
        console.log("Transition Name: ", t.displayName())
        newStateS = newState
        console.log("New state name: ", newState.state)
        if (newState.statusText) console.log("New state status: ", newState.statusText())
        else console.log("No status")
      }

      t.executeTransition(set)
    })

  })
  })



describe("Completed Task Transitions", () => {
  const now = new Date()
  now.setHours(now.getHours() - 1)
  const completedTask = new CompletedTask({tasks: basicTask1, task_id: basicTask1.id, realized_estimation_score: null, realized_importance_score: null, realized_pride_score: null, realized_urgency_score: null, reflection: null})
  const transitions = completedTask.transitions()

  it("can execute all transitions", () => {

    transitions.forEach(t => {

      let newStateS: TaskState

      const set = (newState: TaskState) => {
        console.log("Transition Name: ", t.displayName())
        newStateS = newState
        console.log("New state name: ", newState.state)
        if (newState.statusText) console.log("New state status: ", newState.statusText())
        else console.log("No status")
      }

      t.executeTransition(set)
    })

  })
})

