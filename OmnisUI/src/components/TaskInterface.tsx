import { Motion, Presence } from "@motionone/solid";
import { Session } from "@supabase/supabase-js";
import { spring } from "motion";
import { AiOutlineCalendar, AiOutlineCloseCircle, AiOutlinePlusCircle, AiOutlineUnorderedList } from "solid-icons/ai";
import { IoDocumentTextOutline } from 'solid-icons/io'
import { BsFlag, BsHourglass } from "solid-icons/bs";
import { createEffect, createResource, createSignal, For, JSXElement, Show } from "solid-js";
import DatePicker from "./DatePicker";
import { v4 as randomUUID } from 'uuid';
import { BiRegularCheckbox, BiRegularCheckboxChecked } from "solid-icons/bi";
import { FaRegularTrashCan } from "solid-icons/fa";
import { Importance, UnscheduledTask } from "../utils/autoscheduling";
import { DropDown } from "./Dropdown";
import { Goal } from "../SettingsView";
import {FiTarget} from "solid-icons/fi"
import { getGoalsFromDB } from "../utils/database/databaseFunctions";
import { newNotification } from "../App";
import Notification from "./Notification";

export default function TaskInterface(props: {
  session: Session,
  task?: UnscheduledTask,
  show: boolean,
  close: () => void,
  onDelete?: (task: UnscheduledTask) => void,
  onCreate?: (task: UnscheduledTask) => void,
  onUpdate?: (task: UnscheduledTask) => void
}) {
  // How do I click a button that is passed in from the parent, but give the parent the data back for its specific calculation. 

  const [taskName, setTaskName] = createSignal<string>()
  const [dueDate, setDueDate] = createSignal<Date>()
  const [taskImportance, setTaskImportance] = createSignal<Importance>() // TODO: Load this up
  const [taskDuration, setTaskDuration] = createSignal<number | null>() // TODO: Change to minutes
  const [taskDescription, setTaskDescription] = createSignal<string | null>()
  const [startDate, setStartDate] = createSignal<Date | null>()
  const [goals, setGoals] = createSignal<string[] | null>()



  createEffect(() => console.log(startDate()))

  const [steps, setSteps] = createSignal<UnscheduledTask["steps"]>()

  const populate = () => {
    setTaskName(props.task?.name)
    setDueDate(props.task?.due_date)
    setTaskDuration(props.task?.duration)
    setTaskDescription(props.task?.description)
    setSteps(props.task?.steps)
    setTaskImportance(props.task?.importance)
    setStartDate(props.task?.start_date)
    setGoals(props.task?.goals)
  }

  const getTaskFromInputs = () => {
    // Log all properties
    console.log("Task name", taskName())
    console.log("Due date", dueDate())
    console.log("Task importance", taskImportance())
    console.log("Task duration", taskDuration())
    console.log("Task description", taskDescription())
    console.log("Task steps", steps())
    console.log("Task start date", startDate())

    // TODO: checks on types?

    const task: UnscheduledTask = {
      id: props.task?.id ?? randomUUID(),
      due_date: dueDate()!,
      name: taskName()!,
      duration: taskDuration()!, // TODO: Make this not required and the others
      importance: taskImportance()!,
      description: taskDescription() ?? "",
      steps: steps() ?? null,
      start_date: startDate()!,
      goals: goals() ?? null
    }

    return task
  }

  const [inputRef, setInputRef] = createSignal<HTMLInputElement>()

  createEffect(() => {
    if (props.show) {
      populate()
      if (!props.task?.name) {
        inputRef()?.focus() // TODO: Will this work?
      }
    }
  })

  const getGoals = async () => {
    const {data, error} = await getGoalsFromDB(props.session)
    if (error) {
      newNotification(<Notification type="error" text={"Error Getting Goals"} />)
      return
    }
    return data
  }
  const [allGoals] = createResource(getGoals)

  return (
    <>
      <Presence>
        <Show when={props.show}>
          <Motion.div
            animate={{
              opacity: [0, .2],
            }}

            transition={{
              duration: .6,
            }}

            exit={{
              opacity: [.2, 0],
            }}

            class="w-full fixed h-screen bg-black top-0 z-40"
          />
        </Show>
      </Presence>

      <Presence>
        <Show when={props.show}>
          <Motion.div
            animate={{
              opacity: [0, 1],
              height: ["0%", "89%"]
            }}

            transition={{
              duration: .6,
            }}

            exit={{
              opacity: [1, 0],
              maxHeight: ["90%", "0%"]
            }}

            class="w-full overflow-y-hidden fixed z-50 bg-white bottom-0 rounded-tr-3xl rounded-tl-3xl"
          >

            {/* Header */}
            <div class="bg-background-secondary h-[25%] pt-8 pb-4 px-4">


              <div class="flex flex-row items-center mb-2 gap-2">
                <AiOutlineCloseCircle onclick={props.close} size={50} class="fill-secondary left-6 top-12" />

                {props.onDelete && (
                  <button onclick={() => { props.onDelete!(getTaskFromInputs()); props.close();}} class="ml-auto border-2 border-red-300 bg-red-200 rounded-lg px-3 py-1 font-bold text-xl shadow-md">Delete</button>
                )}

                {props.onUpdate && (
                  <button onclick={() => { props.onUpdate!(getTaskFromInputs()); props.close();}} class="bg-white rounded-lg px-3 py-1 font-bold text-xl shadow-md">Update</button>
                )}

                {props.onCreate && (
                  <button onclick={() => {props.close(); props.onCreate!(getTaskFromInputs())}} class="ml-auto bg-white rounded-lg px-3 py-1 font-bold text-xl shadow-md">Create</button>
                )}

              </div>

              <input 
                type="text" 
                class="w-full px-4 h-10 py-2 mx-auto font-bold flex justify-center items-center bg-background-secondary text-3xl placeholder-primary" 
                placeholder="Add Task Name" 
                value={taskName() ?? ""}
                onchange={(e) => setTaskName(e.currentTarget.value ?? "")}
                ref={setInputRef}
              />

            </div>

            <div class="overflow-scroll max-h-[75%] pb-20">
              <div class="flex flex-row flex-wrap justify-start items-center text-secondary gap-2 mt-5 px-4">
                <AiOutlineCalendar size={35} class="fill-secondary" />

                <h3 class="text-secondary whitespace-nowrap">This task is due</h3>

                <DatePicker 
                  id="dueDate" 
                  class="bg-background-secondary text-primary font-bold px-3 py-1 rounded-xl shadow-md flex items-center border-2 border-neutral-200 w-40" 
                  setDate={setDueDate}
                  value={dueDate()}
                />

              </div>

              <div class="flex flex-row flex-wrap justify-start items-center text-secondary gap-2 mt-5 px-4">
                <AiOutlineCalendar size={35} class="fill-secondary" />

                <h3 class="text-secondary whitespace-nowrap">Start on</h3>

                <DatePicker 
                  id="startDate" 
                  class="bg-background-secondary text-primary font-bold px-3 py-1 rounded-xl shadow-md flex items-center border-2 border-neutral-200 w-40" 
                  setDate={setStartDate}
                  value={startDate() ?? undefined} // TODO: This is shit
                />

              </div>

              <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
                <BsFlag size={35} class="fill-secondary" />

                <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3">
                  This task has 
                  <DropDown<Importance>
                    choices={[
                      {value: "High", display: "High"},
                      {value: "Low", display: "Low"}
                    ]} 
                    choiceOutput={taskImportance()?.toString()} 
                    setChoice={setTaskImportance}
                  >
                    Select
                  </DropDown>
                  importance
                </div>

              </div>

              <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
                <BsHourglass size={35} class="fill-secondary" />

                <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3">

                  It should take

                  {/* TODO: MAke this better */ }
                  <DropDown<number> 
                    choices={[
                      {display: "30min", value: 30},
                      {display: "1hr", value: 60},
                      {display: "1.5hr", value: 90},
                      {display: "2hr", value: 120},
                    ]} 
                    setChoice={(choice: number) => setTaskDuration(choice)} 
                    choiceOutput={taskDuration() ? (taskDuration()! / 60 < 1 ? `${taskDuration()!}min` : `${taskDuration()! / 60}hr`) : null}
                  >
                    Duration
                  </DropDown>

                </div>

              </div>

              {allGoals() ? 
                <div class="flex flex-row justify-start items-center text-secondary gap-2 mt-9 px-4">
                  <FiTarget size={30} />
                  <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3">

                    This is for

                    {/* TODO: MAke this better */ }
                    <DropDown<string | null> 
                      choices={[allGoals()!.map(g => {return {display: g.name, value: g.id}}), {display: "None", value: null}].flat()} 
                      setChoice={(choice: string | null) => { choice === null ? setGoals(null) : setGoals([choice])}} 
                      choiceOutput={goals() ? allGoals()!.find(g => g.id === goals()![0])?.name ?? "None" : "None"}
                    >
                      Goal
                    </DropDown>

                  </div>
                </div> :
                null
              }

              <div class="flex flex-row justify-start items-center text-secondary font-bold gap-2 mt-9 px-4">
                <AiOutlineUnorderedList size={20} class="fill-secondary ml-2" />
                Steps
              </div>

              <For each={steps()}>
                {(step, index) => 
                  <Step step={step} delete={() => setSteps(steps()?.filter(s => s.id !== step.id))} setStep={(step: NonNullable<UnscheduledTask["steps"]>[0]) => setSteps(steps()!.map((s) => s.id === step.id ? step : s))} />
                }
              </For>

              <div class="flex flex-row items-center justify-start w-[90%] mx-auto gap-1 text-secondary">
                <AiOutlinePlusCircle 
                  size={25} 
                  class="fill-secondary ml-1" 
                  onclick={() => {
                    if (steps()) {
                      setSteps([...steps()!, {id: crypto.randomUUID(), description: "", duration: 1, completed: false, edited: false}])
                    } else {
                      setSteps( [ {id: crypto.randomUUID(), description: "", duration: 1, completed: false, edited: false} ]) 
                    }
                  }} />
              </div>

              <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
                <IoDocumentTextOutline size={35} class="fill-secondary" />

                <textarea

                  style={{
                    "box-shadow": "inset 0px 3px 4px 1px rgba(0, 0, 0, 0.15)",
                  }}

                  class="bg-background-secondary p-2 rounded-lg w-full"
                  placeholder="Why is this important?" 

                  value={taskDescription() ?? ""} 

                  onChange={(e) => setTaskDescription(e.currentTarget.value ?? "")}
                />

              </div>
            </div>
          </Motion.div>

        </Show>
      </Presence>
    </>
  )
}



function Step(props: {step: NonNullable<UnscheduledTask["steps"]>[0], setStep: (step: NonNullable<UnscheduledTask["steps"]>[0]) => void, delete: () => void}) {
  const toggleCompleted = () => props.setStep({...props.step, completed: !props.step.completed})
  return (
    <div class="flex flex-row items-center justify-start w-[90%] mx-auto gap-1 text-secondary">
      {props.step.completed ? 
        <BiRegularCheckboxChecked size={30} class="fill-secondary" onclick={toggleCompleted} />
        : <BiRegularCheckbox size={30} class="fill-secondary" onclick={toggleCompleted} />
      }

      <span 
        ontouchstart={(e) => { 
          if(!props.step.edited) {
            e.currentTarget.textContent = " "
          }

        }}
        contenteditable 
        onfocusout={(e) => {
          console.log(e.currentTarget.textContent)

          if (e.currentTarget.textContent === "") return

          props.setStep({...props.step, description: e.currentTarget.textContent! ?? "", edited: true})
        }} 
        class="min-w-[60%] max-w-[60%]"
      >
        {props.step.description !== "" ? props.step.description : "Add step"}
      </span>

      <span class="flex ml-auto mr-8 flex-row items-center justify-center text-secondary">
        <FaRegularTrashCan size={15} class="fill-secondary" onclick={() => props.delete()} />
      </span>
    </div>

  )
}
