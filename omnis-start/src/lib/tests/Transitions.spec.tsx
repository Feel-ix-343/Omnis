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

  it("has start-task transition", () => {

    expectTypeOf(transitions[0]).toMatchTypeOf<StateTransition<PlannedTask, WorkingTask>>()

  })

  it("can execute first transition", () => {
    let workingTask: WorkingTask

    const set = (w: WorkingTask) => {
      workingTask = w

      expect(workingTask).not.toBeUndefined()
      expect(workingTask.startTime().toLocaleTimeString()).eq(new Date().toLocaleTimeString())
    }


    transitions[0].executeTransition(plannedTask, set)
  })

  it("can execute all transitions", () => {

    transitions.forEach(t => {

      let newStateS: TaskState

      const set = (newState: TaskState) => {
        console.log("Transition Name: ", t.displayName(plannedTask))
        newStateS = newState
        console.log("New state name: ", newState.state)
        if (newState.statusText) console.log("New state status: ", newState.statusText())
        else console.log("No status")
      }

      t.executeTransition(plannedTask, set)
    })


  })
})


describe("Working Task Transitions", () => {
  const now = new Date()
  now.setHours(now.getHours() - 1)
  const workingTask = new WorkingTask({tasks: basicTask1, start: now.toString(), task_id: basicTask1.id})
  const transitions = TaskStateMachine[workingTask.state]

  it("can execute all transitions", () => {

    console.log("Working Status: ", workingTask.statusText())
    transitions.forEach(t => {

      let newStateS: TaskState

      const set = (newState: TaskState) => {
        console.log("Transition Name: ", t.displayName(workingTask))
        newStateS = newState
        console.log("New state name: ", newState.state)
        if (newState.statusText) console.log("New state status: ", newState.statusText())
        else console.log("No status")
      }

      t.executeTransition(workingTask, set)
    })

  })
  })



describe("Completed Task Transitions", () => {
  const now = new Date()
  now.setHours(now.getHours() - 1)
  const completedTask = new CompletedTask({tasks: basicTask1, task_id: basicTask1.id, realized_estimation_score: null, realized_importance_score: null, realized_pride_score: null, realized_urgency_score: null, reflection: null})
  const transitions = TaskStateMachine[completedTask.state]

  it("can execute all transitions", () => {

    transitions.forEach(t => {

      let newStateS: TaskState

      const set = (newState: TaskState) => {
        console.log("Transition Name: ", t.displayName(completedTask))
        newStateS = newState
        console.log("New state name: ", newState.state)
        if (newState.statusText) console.log("New state status: ", newState.statusText())
        else console.log("No status")
      }

      t.executeTransition(completedTask, set)
    })

  })
})

