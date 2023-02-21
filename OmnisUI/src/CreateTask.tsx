import { Motion, Presence, PresenceContext } from "@motionone/solid";
import { Session } from "@supabase/supabase-js";
import { spring } from "motion";
import { AiOutlineCalendar, AiOutlineCloseCircle } from "solid-icons/ai";
import { IoDocumentTextOutline } from 'solid-icons/io'
import { BsFlag, BsHourglass } from "solid-icons/bs";
import { createEffect, createSignal, For, JSXElement, onMount, Show } from "solid-js";
import Header from "./components/Header";
import DatePicker from "./components/DatePicker";
import { supabase } from "./database/supabaseClient";

export default function(props: {session: Session, show: boolean, close: () => void}) {

  const [taskName, setTaskName] = createSignal<string>()
  const [dueDate, setDueDate] = createSignal<Date>()
  const [taskImportance, setTaskImportance] = createSignal<string>()
  const [taskDuration, setTaskDuration] = createSignal<number>()
  const [taskDescription, setTaskDescription] = createSignal<string>()


  const createTask = async () => {
    // Log all properties
    console.log("Task name", taskName())
    console.log("Due date", dueDate())
    console.log("Task importance", taskImportance())
    console.log("Task duration", taskDuration())
    console.log("Task description", taskDescription())


    // TODO: Make this better
    if (taskName() === undefined || !dueDate() || !taskImportance() || !taskDuration()) return console.log("Fill out all fields")

    const task: Task = {
      id: crypto.randomUUID(),
      date: new Date(),
      name: taskName(),
      time: new Date().getHours(),
      duration: taskDuration(),
      priority: 4,
      completed: false,
      description: taskDescription()
    }

    console.log("task", task)

    const DBTask: DBTask = {
      ...task,
      description: task.description ?? null,
      user_id: props.session.user.id,
      date: task.date.toISOString()
    }

    console.log("DBTask", DBTask)

    const {data, error} = await supabase.from("tasks").insert(DBTask)
    console.log(data, error)
  }

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
            <div class="bg-background-secondary pt-8 pb-4 px-4">


              <div class="flex flex-row items-center mb-2 gap-2">
                <AiOutlineCloseCircle onclick={props.close} size={50} class="fill-secondary left-6 top-12" />
                <button onclick={() => {props.close(); createTask()}} class="ml-auto bg-white rounded-lg px-3 py-1 font-bold text-xl shadow-md">Create</button>
              </div>

              <input 
                type="text" 
                class="w-full px-4 h-7 py-2 font-bold text-center bg-background-secondary text-3xl placeholder-primary" 
                placeholder="Add Task Name" 
                onchange={(e) => setTaskName(e.currentTarget.value ?? "")}
              />

            </div>

            <div class="flex flex-row flex-wrap justify-start items-center text-secondary gap-2 mt-5 px-4">
              <AiOutlineCalendar size={35} class="fill-secondary" />

              <h3 class="text-secondary whitespace-nowrap">This task is due</h3>

              <DatePicker 
                id="dueDate" 
                class="bg-background-secondary text-primary font-bold px-3 py-1 rounded-xl shadow-md flex items-center border-2 border-neutral-200 w-40" 
                setDate={setDueDate}
              />

            </div>

            <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
              <BsFlag size={35} class="fill-secondary" />

              <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3">
                This task has <DropDown choices={["High", "Medium", "Low"]} choice={taskImportance()} setChoice={setTaskImportance}>Select</DropDown> importance in <div class="flex flex-row bg-background-secondary p-1 rounded-full font-bold text-primary text-sm">Being more active in school</div>
              </div>

            </div>

            <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
              <BsHourglass size={35} class="fill-secondary" />

              <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3">

                It should take

                {/* TODO: MAke this better */ }
                <DropDown choices={[".3", "1", "2", "3"]} setChoice={(c: string) => setTaskDuration(parseInt(c))} choice={taskDuration()?.toString()}>Duration</DropDown>

              </div>

            </div>

            <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
              <IoDocumentTextOutline size={35} class="fill-secondary" />

              <textarea

                style={{
                  "box-shadow": "inset 0px 3px 4px 1px rgba(0, 0, 0, 0.15)",
                }}

                class="bg-background-secondary p-2 rounded-lg w-full"
                placeholder="Why is this important?" 

                onChange={(e) => setTaskDescription(e.currentTarget.value ?? "")}
              />

            </div>
          </Motion.div>

        </Show>
      </Presence>
    </>
  )
}

function Button(props: {children: JSXElement, class?: string, focuschange?: () => void}) {
  return (
    <button 
      class={ "bg-background-secondary text-primary font-bold px-3 py-1 rounded-xl shadow-md flex items-center border-2 border-neutral-200 " + props.class } 
      onfocus={props.focuschange}
      onfocusout={props.focuschange}
    >{props.children}</button>
  )
}

function DropDown(props: {children: JSXElement, choices: string[], choice?: string, setChoice: (c: string) => void}) {
  const [show, setShow] = createSignal(false)

  return (
    <div class="flex flex-col justify-center items-center">
      <Button class={(show() ? "opacity-0" : "") + " w-20 flex items-center justify-center"} focuschange={() => setShow(!show())}>{props.choice ?? props.children}</Button>
      <Presence>
        <Show when={show()}>
          <Motion.div

            transition={{duration: .3, easing: spring()}}

            animate={{
              scale: [.7, 1],
              scaleY: [0, 1],
            }}

            exit={{
              scale: [1, .7],
              scaleY: [1, .4],
              opacity: [1, 1, 1, 0]
            }}

            class="w-20 absolute bg-background-secondary rounded-xl shadow-xl border-2 border-neutral-200 p-2 overflow-hidden flex flex-col justify-center items-center"
          >
            <For each={props.choices}>
              {(choice, index) => <button onClick={() => props.setChoice(props.choices[index()])} class="font-bold text-primary">{choice}</button>}
            </For>
          </Motion.div>
        </Show>
      </Presence>
    </div>
  )
}
