import { Motion, Presence } from "@motionone/solid";
import { Session } from "@supabase/supabase-js";
import { spring } from "motion";
import { AiOutlineCalendar, AiOutlineCloseCircle, AiOutlinePlusCircle } from "solid-icons/ai";
import { IoDocumentTextOutline } from 'solid-icons/io'
import { BsFlag, BsHourglass } from "solid-icons/bs";
import { createEffect, createSignal, For, JSXElement, Show } from "solid-js";
import DatePicker from "./DatePicker";
import { v4 as randomUUID } from 'uuid';
import { BiRegularCheckbox } from "solid-icons/bi";

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

  const [steps, setSteps] = createSignal<UnscheduledTask["steps"]>()

  const populate = () => {
    setTaskName(props.task?.name)
    setDueDate(props.task?.due_date)
    setTaskDuration(props.task?.duration)
    setTaskDescription(props.task?.description)
    setSteps(props.task?.steps)
    setTaskImportance(props.task?.importance)
  }

  const getTaskFromInputs = () => {
    // TODO: Implement the importance metric

    // Log all properties
    console.log("Task name", taskName())
    console.log("Due date", dueDate())
    console.log("Task importance", taskImportance())
    console.log("Task duration", taskDuration())
    console.log("Task description", taskDescription())
    console.log("Task steps", steps())

    // TODO: checks on types?
    const task: UnscheduledTask = {
      id: props.task?.id ?? randomUUID(),
      due_date: dueDate()!,
      name: taskName()!,
      duration: taskDuration()!, // TODO: Make this not required and the others
      importance: taskImportance()!,
      description: taskDescription() ?? "",
      steps: steps() ?? null
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

            class="w-full h-screen bg-black absolute top-0 z-40"
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
              height: ["90%", "0%"]
            }}

            class="w-full overflow-y-hidden fixed z-50 bg-white bottom-0 rounded-tr-3xl rounded-tl-3xl"
          >

            {/* Header */}
            <div class="bg-background-secondary pt-8 pb-4 px-4">


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
                importance in <div class="flex flex-row bg-background-secondary p-1 rounded-full font-bold text-primary text-sm">Being more active in school</div>
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

            Steps

            <For each={steps()}>
              {(step) => 
                <Step step={step} setStep={(step: NonNullable<UnscheduledTask["steps"]>[0]) => setSteps(steps()!.map((s) => s.id === step.id ? step : s))} />
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
          </Motion.div>

        </Show>
      </Presence>
    </>
  )
}

function Button(props: {children: JSXElement, class?: string, focus?: {focuson: () => void, focusoff: () => void}}) {



  return (
    <button 
      class={ "bg-background-secondary text-primary font-bold px-3 py-1 rounded-xl shadow-md flex items-center border-2 border-neutral-200 " + props.class } 
      ontouchstart={props.focus?.focuson}
    >{props.children}</button>
  )
}

interface DropDownChoice<T> {
  display: string,
  value: T
}


function DropDown<T>(props: {children: JSXElement, choices: DropDownChoice<T>[], choiceOutput?: string | null, setChoice: (choiceValue: T) => void, class?: string}) {
  const [show, setShow] = createSignal(false)

  const [ref, setRef] = createSignal<HTMLButtonElement>()

  createEffect(() => {
    document.addEventListener("touchstart", (e) => {
      if (ref()?.contains(e.target)) return // TODO: FIx
      else setShow(false)
    })
  })

  return (
    <div ref={setRef} class={ "flex flex-col justify-center items-center " + props.class}>

      <Button class={(show() ? "opacity-0" : "") + " w-20 flex items-center justify-center"} focus={{focuson: () => setShow(true), focusoff: () => setShow(false)}}>
        {props.choiceOutput ?? props.children}
      </Button>

      <Presence>
        <Show when={show()}>
          <Motion.div

            transition={{duration: .3, easing: spring()}}

            animate={{
              scale: [.7, 1],
              scaleY: [0, 1],
            }}

            exit={{
              opacity: [1, 0]
            }}

            class="w-20 absolute bg-background-secondary rounded-xl shadow-xl border-2 border-neutral-200 p-2 overflow-hidden flex flex-col justify-center items-center"
          >
            <For each={props.choices}>
              {(choice, index) => <button onClick={() => {props.setChoice(props.choices[index()].value); setShow(false)}} class="font-bold text-primary">{choice.display}</button>}
            </For>
          </Motion.div>
        </Show>
      </Presence>
    </div>
  )
}


function Step(props: {step: NonNullable<UnscheduledTask["steps"]>[0], setStep: (step: NonNullable<UnscheduledTask["steps"]>[0]) => void}) {
  return (
    <div class="flex flex-row items-center justify-start w-[90%] mx-auto gap-1 text-secondary font-semibold">
      <BiRegularCheckbox size={30} class="fill-secondary" />

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
        <DropDown<number> 
          choices={[
            {display: "30min", value: .5},
            {display: "1hr", value: 1},
            {display: "1.5hr", value: 1.5},
            {display: "2hr", value: 2},
          ]} 
          setChoice={(choice: number) => props.setStep({...props.step, duration: choice})} 
          choiceOutput={props.step.duration < 1 ? `${props.step.duration * 60}min` : `${props.step.duration}hr`}
          class="text-xs"
        >
        </DropDown>
      </span>
    </div>

  )
}
