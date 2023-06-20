import { Motion, Presence } from "@motionone/solid"
import { Session } from "@supabase/supabase-js"
import { randomUUID } from "crypto"
import { spring } from "motion"
import { AiOutlineCloseCircle, AiOutlineInfoCircle } from "solid-icons/ai"
import { BsFlag, BsPlus, BsPlusCircle } from "solid-icons/bs"
import { FaRegularFlag, FaSolidCircleInfo } from "solid-icons/fa"
import { FiTarget } from "solid-icons/fi"
import { IoDocumentTextOutline } from "solid-icons/io"
import { createEffect, createResource, createSignal, For, onMount, Show } from "solid-js"
import { newInfoPopup, newNotification } from "./App"
import { DropDown } from "./components/Dropdown"
import Notification from "./components/Notification"
import { deleteDBGoal, getGoalsFromDB, upsertDBGoal } from "./utils/database/databaseFunctions"
import { supabase } from "./utils/database/supabaseClient"

export default function SettingsView(props: {session: Session}) {

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // TODO: Get name from database

  const [startHour, setStartHour] = createSignal<number>()
  const [endHour, setEndHour] = createSignal<number>()

  const loadStartEndHour = async () => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('start_time, end_time')
      .eq('user_id', props.session.user.id)
      .maybeSingle()

    if (error) {
      newNotification(<Notification type="error" text="Could not load settings" />)
    }

    setStartHour(data?.start_time ?? 9)
    setEndHour(data?.end_time ?? 17)
  }

  onMount(() => {
    loadStartEndHour()
  })


  createEffect(async () => {
    console.log("startHour", startHour())
    console.log("endHour", endHour())

    if (startHour() === undefined || endHour() === undefined) {
      return
    }

    // TODO: Use zod validation here
    const { data, error } = await supabase.from('user_settings').upsert({
      user_id: props.session.user.id,
      start_time: startHour()!,
      end_time: endHour()!
    })

    if (error) {
      newNotification(<Notification type="error" text="Could not save settings" />)
    }
  })

  const [goalToEdit, setGoalToEdit] = createSignal<Goal | null>(null)
  const onUpdate = () => {
    if (goalToEdit() !== null) {
      return (g: Goal) => {
        upsertDBGoal(g, props.session).then(() => refetch())
      }
    }
  }
  const onDelete = () => {
    if (goalToEdit() !== null) {
      return (g: Goal) => {
        deleteDBGoal(g, props.session).then(() => refetch())
      }
    }
  }
  const onCreate = () => {
    if (goalToEdit() === null) {
      return (g: Goal) => {
        upsertDBGoal(g, props.session).then(() => refetch())
      }
    }
  }
  const [show, setShow] = createSignal(false)
  const close = () => { setShow(false) }
  const getGoals = async () => {
    let {data: goals, error} = await getGoalsFromDB(props.session)
    if (error) {
      newNotification(<Notification type={"error"} text="Error Getting Goals" />)
      return null
    }
    return goals
  }
  const [goals, {mutate, refetch}] = createResource(getGoals)

  return (
    <div class="pt-36 px-7 pb-[15vh]">

      <EditGoal show={show()} goal={goalToEdit()} close={close} onDelete={onDelete()} onCreate={onCreate()} onUpdate={onUpdate()} />

      <div class="fixed bg-background-secondary rounded-br-3xl rounded-bl-3xl shadow-lg p-10 max-h-40 top-0 right-0 left-0">
        <h1 class="text-xl">Hello {props.session.user.email}</h1>
        <h3>Here are your settings</h3>
      </div>

      <div class="flex flex-row items-center">
        <h2>Objectives</h2>

        <Motion.div 
          class="flex flex-row ml-auto gap-1 items-center justify-center bg-background-secondary rounded-full px-3 py-1 shadow-sm border-2 text-secondary"
          press={{
            scale: 0.9
          }}
          onclick={() => {
            newInfoPopup({pages: [ // TODO: It would be cool if I had a markdown renderer that would break this text up page by page
              {
                title: "What are Objectives?",
                description: <>
                  In Omnis, there are two types of goals: tasks and objectives. Tasks are the short term steps that contribute to objectives. Objectives are the long term goals that you would be extremely rewarded by achieving. 
                </>
              },
              {
                title: "Distraction",
                description: <>
                  We chase objectives to experience the reward that a strong sense achievement yields. However, though many tasks in these persuits are increadibly rewarding, they are not always. They can be stressful, tedious, and difficult. Often, we prefer to do another activity that is more stimulating. This is how distraction occurs: there is another activity, such as going on social media or youtube, that seems much more appealing than the task at hand. 

                </>
              },
              {
                title: "Resisting Distraction",
                description: <>
                  However, the tasks have a purpose too. They are direct contribution to achieving objectives, a reward that is likley to be much greater than the appeal of the distraction. <br/><br/>In order to experience this reward, the appeal of distractions must be resisted and difficult tasks must be completed, so that experiencing the reward of achieving an objective is possible.
                </>
              },
              {
                title: "Objectives and Tasks in Omnis",
                description: <>
                  By creating objectives in Omnis, a new field appears when you view a task. This field allows you to relate a task to a major objective. This relation helps you to take your objectives into account when planning, and to resist distraction through building motivation to complete the task instead of getting distracted.
                </>
              }
            ]})
          }}
        >
          <AiOutlineInfoCircle size={20} 
            class="fill-secondary" 
          />
          Details
        </Motion.div>
      </div>

      <div class="rounded-lg bg-background-secondary p-2 text-primary mt-2 border-2">

        {goals.loading ? <>Loading...</> : null}
        <For each={goals()}>
          {g => <Goal goal={g} onclick={t => { setShow(true); setGoalToEdit(t) }} /> }
        </For>

        <Motion.div
          press={{ scale: [.9] }}
          class="flex justify-center items-center gap-2 text-secondary w-32 mx-auto bg-background-primary rounded-full shadow-sm py-1 border-[1px] border-zinc-120"
          classList={{"mt-2": goals() !== null}}
          onclick={() => { setShow(true); setGoalToEdit(null) }}
        >
          <BsPlusCircle class="fill-secondary" /> New Goal
        </Motion.div>

      </div>

      <div class="flex flex-row items-center">
        <h2>Scheduling Settings</h2>

        <Motion.div 
          class="flex flex-row ml-auto gap-1 items-center justify-center bg-background-secondary rounded-full px-3 py-1 shadow-sm border-2 text-secondary"
          press={{
            scale: 0.9
          }}
          onclick={() => {
            newInfoPopup({pages: [
              {
                title: "Start and End Times",
                description: <>
                  These are the times when your tasks can be scheduled.
                </>
              }
            ]})
          }}
        >
          <AiOutlineInfoCircle size={20} 
            class="fill-secondary" 
          />
          Details
        </Motion.div>
      </div>

      <div class="grid grid-cols-3 bg-background-secondary border-2 rounded-xl p-4 gap-3">
        <h4>Start hour (military)</h4><input type="number" class="col-span-2 bg-background-primary border-[1px] rounded-lg px-3" value={startHour()} onInput={e => setStartHour(parseInt(e.currentTarget.value))} />
        <h4>End hour (military)</h4><input type="number" class="col-span-2 bg-background-primary border-[1px] rounded-lg px-3" value={endHour()} onInput={e => setEndHour(parseInt(e.currentTarget.value))} />
      </div>

      <h2>Account</h2>

      <button 
        class="px-3 py-1 bg-highlight border-2 border-green-400 shadow-sm rounded-full mx-2 active:scale-90 transition-all"
        onclick={logout}
      >
        Log out
      </button>
    </div>
  )
}

export interface Goal {
  id: string,
  name: string,
  description: string | null, 
  importance: "high" | "medium" | "low"
}

function Goal(props: {goal: Goal, onclick: (goal: Goal) => void}) {
  return <><Motion.div
    press={{ scale: [.9] }}
    transition={{duration: 0.1, easing: spring()}}
    onclick={() => props.onclick(props.goal)}
    class="flex flex-row gap-4 my-2 items-center px-2"
  >

    {props.goal.importance == "high"}
    <FaRegularFlag classList={ { "fill-red-500": props.goal.importance == "high", "fill-blue-400": props.goal.importance == "medium", "fill-zinc-400": props.goal.importance == "low" } } />

    <div class="flex flex-col">
      <h3 class="font-semibold text-sm">{props.goal.name}</h3>
      <p class="text-xs font-thin">{props.goal.description}</p>
    </div>


  </Motion.div>
    <hr class="bg-background-secondary" />
  </>
}

function EditGoal(props: {show: boolean, goal: Goal | null, close: () => void, onCreate?: (goal: Goal) => void, onUpdate?: (goal: Goal) => void, onDelete?: (goal: Goal) => void}) {

  createEffect(() => console.log("Goal", props.goal))

  const [importance, setImportance] = createSignal(props.goal?.importance)
  const [name, setName] = createSignal(props.goal?.name)
  const [description, setDescription] = createSignal(props.goal?.description)
  createEffect(() => {
    if (props.show === true) {
      setImportance(props.goal?.importance)
      setName(props.goal?.name)
      setDescription(props.goal?.description)
    }
  })

  const getGoalFromInputs = () => {
    if (!name() || !importance()) {
      newNotification(<Notification type="error" text="Please fill in all fields" />)
      return
    }

    let id = props.goal?.id ? props.goal.id : crypto.randomUUID()

    return {
      id,
      name: name()!,
      description: description()!,
      importance: importance()!
    } satisfies Goal
  }

  const [inputRef, setInputRef] = createSignal<HTMLInputElement>()

  createEffect(() => {
    if (props.goal) {
      //populate()
      if (!props.goal?.name) {
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
              duration: .3,
            }}

            exit={{
              opacity: [.2, 0]
            }}

            class="w-full fixed h-screen bg-black top-0 left-0 right-0 z-40"

            onclick={props.close}
          />
        </Show>
      </Presence>

      <Presence>
        <Show when={props.show}>
          <Motion.div
            animate={{
              opacity: [0, 1],
              height: ["0%", "90%"]
            }}

            transition={{
              duration: .6,
            }}

            exit={{
              opacity: [1, 0],
              height: ["90%", "0%"]
            }}

            class="w-full overflow-y-hidden fixed z-50 bg-white bottom-0 rounded-tr-3xl rounded-tl-3xl left-0 right-0"
          >

            {/* Header */}
            <div class="bg-background-secondary pt-8 pb-4 px-4">


              <div class="flex flex-row items-center mb-2 gap-2">
                <AiOutlineCloseCircle onclick={props.close} size={50} class="fill-secondary left-6 top-12" />

                {props.onDelete && (
                  <button onclick={() => { props.onDelete!(getGoalFromInputs()!); props.close();}} class="ml-auto border-2 border-red-300 bg-red-200 rounded-lg px-3 py-1 font-bold text-xl shadow-md">Resolve</button>
                )}

                {props.onUpdate && (
                  <button onclick={() => { props.onUpdate!(getGoalFromInputs()!); props.close();}} class="bg-white rounded-lg px-3 py-1 font-bold text-xl shadow-md">Update</button>
                )}

                {props.onCreate && (
                  <button onclick={() => {props.close(); getGoalFromInputs() && props.onCreate!(getGoalFromInputs()!)}} class="ml-auto bg-white rounded-lg px-3 py-1 font-bold text-xl shadow-md">Create</button>
                )}

              </div>

              <input 
                type="text" 
                class="w-full px-4 h-10 py-2 mx-auto font-bold flex justify-center items-center bg-background-secondary text-3xl placeholder-primary" 
                placeholder="Add Objective Name" 
                value={name() ?? ""}
                onchange={(e) => setName(e.currentTarget.value ?? "")}
                ref={setInputRef}
              />

            </div>

            <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
              <BsFlag size={35} class="fill-secondary" />

              <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3">
                This goal has 
                <DropDown<Goal['importance']>
                  choices={[
                    {value: "high", display: "High"},
                    {value: "medium", display: "Medium"},
                    {value: "low", display: "Low"}
                  ]} 
                  choiceOutput={importance()?.toString()} 
                  setChoice={setImportance}
                >
                  Select
                </DropDown>
                importance
              </div>

            </div>

            <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
              <IoDocumentTextOutline size={35} class="fill-secondary" />

              <textarea

                style={{
                  "box-shadow": "inset 0px 3px 4px 1px rgba(0, 0, 0, 0.15)",
                }}

                class="bg-background-secondary p-2 rounded-lg w-full"
                placeholder="What is this goal?" 

                value={description() ?? ""} 

                onChange={(e) => setDescription(e.currentTarget.value ?? "")}
              />

            </div>
          </Motion.div>

        </Show>
      </Presence>
    </>
  )
}
