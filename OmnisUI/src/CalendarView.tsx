import { FaRegularSquareCheck, FaSolidHourglassEnd, FaSolidSquareCheck } from "solid-icons/fa"
import { BiRegularCheckbox, BiSolidCheckboxChecked } from 'solid-icons/bi'
import { Accessor, createEffect, createMemo, createSignal, For, onMount, Show, untrack } from "solid-js"

import { AiFillMinusCircle, AiFillPlayCircle, AiFillPlusCircle, AiOutlineCaretUp } from 'solid-icons/ai'
import { supabase } from "./database/supabaseClient"
import { Session } from "@supabase/supabase-js"
import { Motion, Presence } from "@motionone/solid"
import { spring } from "motion"
import EditTask from "./EditTask"

import {newNotification} from "./App"
import Notification from "./components/Notification"
import { getTasksFromDB, upsertTasks } from "./database/databaseFunctions"




const updateTasksWithDatabase = async (session: Session) => {
  const {data: tasks, error} = await getTasksFromDB(session)

  if (error) {
    console.log(error.message)
    newNotification(<Notification type="error" text="Failed to load tasks" />)
    return
  }

  const displayTasks = tasks ?? []
  setTasks(displayTasks)
}

const updateDBWithTasks = async (tasks: Task[], session: Session) => {

  const {data, error} = await upsertTasks(tasks, session)
  console.log(data, error)
}



// All of the displayed tasks
const [getTasks, setTasks] = createSignal<Task[] | undefined>()


let activeTimeRef: HTMLDivElement;

/** The scale of 1hr in pixels */
const [getScale, setScale] = createSignal(150)


const toggleCompleted = (task: Task) => {
  setTasks(getTasks()?.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))
}


const [day, setDay] = createSignal<Date>(new Date)
const changeDay = (amount: number) => {
  const newDate = new Date(day())
  newDate.setDate(newDate.getDate() + amount)
  setDay(newDate)
}


const [editTask, setEditTask] = createSignal<Task | null>(null)


export default function CalendarView(props: {session: Session}) {
  // addInitialTasks() // For testing purposes

  // initailize tasks
  onMount(() => {
    console.log("Props session", props.session)
    updateTasksWithDatabase(props.session)
  })

  // Scroll to the active time line
  onMount(() => {
    activeTimeRef?.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
  })

  // Sync tasks with the database after a user input
  createEffect(() => {
    if (!getTasks()) return

    updateDBWithTasks(getTasks()!, props.session)
  })

  const tasks = createMemo<{daily: Task[], scheduled: Task[]} | undefined>(() => 
    getTasks()?.reduce(
      (prev, task) => {
        if (task.date.toDateString() !== day().toDateString()) return prev

        if (task.time !==  null) {
          prev.scheduled.push(task)
        } else {
          prev.daily.push(task)
        }

        return prev
      }, 
      { daily: new Array<Task>(), scheduled: new Array<Task>() } // The initial
    )
  )

  const dailyTasks = () => tasks()?.daily
  const scheduledTasks = () => tasks()?.scheduled


  return (
    <div class="pt-40">

      <EditTask onDBChange={() => updateTasksWithDatabase(props.session)} session={props.session} task={editTask()!} show={editTask() !== null} close={() => setEditTask(null)} />

      <CalendarHeader dailyTasks={dailyTasks()} />
      <CalendarBody tasks={scheduledTasks()} />

    </ div>
  )
}

function CalendarHeader(props: {dailyTasks?: Task[]}) {

  const [getDailyExpanded, setDailyExpanded] = createSignal(false)

  const dates = createMemo<Date[]>(() => {
    const dates = []
    for (let i = -2; i <= 2; i++) {
      const date = new Date(day())
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  })

  return (
    <div 
      class="z-10 w-full bg-background-secondary rounded-b-3xl shadow-lg flex flex-col items-center pt-10 pb-3 fixed top-0 transition-all overflow-y-hidden" 
      classList={{"max-h-full": getDailyExpanded(), "max-h-[185px]": !getDailyExpanded()}}
    >
      <div class="flex flex-row gap-2 items-center justify-center">
        <CalendarDate date={dates()[0]} click={() => changeDay(-2)}/>
        <CalendarDate date={dates()[1]} click={() => changeDay(-1)}/>
        <CalendarDate date={dates()[2]} focus={true}/>
        <CalendarDate date={dates()[3]} click={() => changeDay(+1)} />
        <CalendarDate date={dates()[4]} click={() => changeDay(+2)} />
      </div>

      {props.dailyTasks !== undefined && props.dailyTasks.length && (<>
        <div class="flex flex-row mt-3 w-10/12" classList={{"gap-2": !getDailyExpanded()}}>
          <div class="flex-grow flex flex-col" classList={{"gap-1": props.dailyTasks?.length > 1, "gap-0": props.dailyTasks?.length <= 1}}>
            <DailyTask task={props.dailyTasks[0]} show={true} />

            <For each={props.dailyTasks.slice(1)} fallback={null}>
              {(item, index) => (
                <DailyTask task={item} show={getDailyExpanded()} />
              )}
            </For>
          </div>
          <div 
            class="bg-white rounded-full h-8 text-sm text-primary bg-opacity-75 flex justify-center items-center border-2 border-neutral-200 whitespace-nowrap transition-all"
            classList={{"w-0 opacity-0 px-0 pointer-events-none": getDailyExpanded() || props.dailyTasks?.length === 1, "w-20 px-3": !getDailyExpanded() && !(props.dailyTasks?.length === 1)}}
            onclick={() => setDailyExpanded(true)}
          >
            {props.dailyTasks.length - 1} more
          </div>
        </div>

        <AiOutlineCaretUp 
          class="bg-white w-32 mt-3 rounded-full border-2 border-neutral-200"
          onclick={() => setDailyExpanded(false)}
        />
      </>)}



    </div>
  )
}

function DailyTask(props: {task: Task, show: boolean}) {

  return(
    <div class="flex flex-row gap-2 justify-start items-center text-center h-8 bg-secondary p-2 rounded-lg transition-all"
      onclick={() => setEditTask(props.task)}

      classList={{"opacity-0": !props.show}}
    >

      {props.task?.completed ?  // Why is this coming as undefiend? dang javascript
        <BiSolidCheckboxChecked onclick={() => toggleCompleted(props.task)} size={30} class="fill-primary" /> :
        <BiRegularCheckbox onclick={() => toggleCompleted(props.task)} size={30} class="fill-primary" />
      }
      <h3>{props.task.name}</h3>
    </div>
  )
}


function CalendarDate(props: {date: Date, click?: () => void, focus?: boolean}) {

  const dayAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Motion.div 
      class="flex flex-col justify-center items-center bg-white text-center p-3 rounded-xl shadow-md border-[2px] "
      classList={{
        "border-gray-400 w-20": props.focus,
        "border-gray-200 w-14": !props.focus,
        "active:scale-[85%] transition-all": props.click !== undefined,
        "!bg-highlight !border-green-400": props.date.toDateString() === new Date().toDateString()
      }}

      animate={{scale: [.8, 1]}}
      transition={{duration: .3, easing: spring()}}
      press={{scale: .8}}

      onclick={props.click}
    >
      <div class={ "text-gray-500 " + (props.focus ? "font-extrabold text-3xl text-gray-700" : "text-xl") }>{props.date.getDate()}</div>
      <div class={ "text-gray-500 " + (props.focus ? "text-xl font-bold text-gray-700" : null)}>{dayAbbreviations[props.date.getDay()]}</div>
    </Motion.div>
  )
}



function CalendarBody(props: {tasks?: Task[]}) {
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const times = hours.map(i => i + " AM").concat(hours.map(i => i + " PM")).concat("12 PM")

  return(
    <>
      <div class="pb-32 absolute z-0 left-0 right-0">
        {
          times.map((item, index) => {
            return <CalendarLine time={item} />
          })

        }

        <CalendarTimeLine />
      </div>
      <div>
        <For each={props.tasks} fallback={null}>
          {(item, index) => (
            <Event task={item} />
          )}
        </For>
      </div>
    </>
  )
}

function CalendarTimeLine() { // TODO: Fix the timing of this and the tasks when time gets late
  const date = new Date;

  const [minutes, setMinutes] = createSignal<number>(date.getMinutes() + ((date.getHours() + 1) * 60)) // + 1 because 12 = 0 on the cal

  setInterval(() => {
    const date = new Date;
    setMinutes(date.getMinutes() + ((date.getHours() + 1) * 60))
  }, 30000)

  return (
    <Show when={day().toDateString() === new Date().toDateString()}>
      <div
        ref={activeTimeRef}
        style={{
          "margin-top": minutes() * (getScale() / 60) - 5 + "px"
        }}
        class="flex flex-row h-[3px] bg-red-600 absolute w-full top-1">
      </div>
    </Show>
  )
}

function CalendarLine(props: {time: string}) {
  return (
    <div class="flex flex-row items-center mx-auto">
      <span style={{"margin-top": getScale() + "px"}} class="rounded-full absolute left-2 text-secondary basis-12 text-sm flex items-center justify-center">{props.time}</span>

      <div style={{"margin-top": getScale() - 2 + "px"}} class="w-[85%] ml-auto mr-2 h-[2px] bg-secondary"></div>
    </div>
  )
}




function Event(props: {task: Task}) {
  const duration = () => props.task.duration ?? .5

  const startTime = () => (props.task.time! + 1) * getScale()
  const height = () => duration() * getScale()

  const changeDuration = (amt: number) => {
    const tasks = getTasks()

    if (!tasks) {
      console.log("No tasks but adding 15 minutes?")
      return
    }

    setTasks(tasks.map(task => task.id === props.task.id && task.duration !== undefined ? {...task, duration: task.duration! + amt} : task)) // TODO: Make better type, but this should not be null
  }

  const setStartTime = () => {
    const tasks = getTasks()

    if (!tasks) {
      console.log("No tasks but adding 15 minutes?")
      return
    }

    setTasks(tasks.map(task => task.id === props.task.id && task.duration !== undefined ? {...task, time: new Date().getMinutes() / 60 + new Date().getHours()} : task)) // TODO: Make better type, but this should not be null
  }


  // TODO: Figure out how to only rerender the new events and just update the values of the old events

  const getTime = (hours: number) => {
    const minutes = Math.round(hours % 1 * 60)
    return `${Math.floor(hours) % 12}:${minutes < 10 ? "0" + minutes : minutes}`
  }

  return (
    <Motion.div 
      style={{
        "margin-top": `${startTime()}px`,
        "height": `${height()}px`
      }}

      class="absolute bg-opacity-80 flex flex-col justify-start py-3 items-start shadow-lg border-red-300 border-2 bg-red-300 w-80 ml-12 rounded-xl overflow-y-hidden p-2 text-center"
    >
      <div class="flex w-full items-center justify-start">

        { !props.task.completed ? // Add animations to this
          <BiRegularCheckbox onclick={() => toggleCompleted(props.task)} size={35} class='fill-primary' /> :
          <BiSolidCheckboxChecked onclick={() => toggleCompleted(props.task)} size={35} class='fill-primary' />
        }

        <h1 class="flex items-center text-lg">{props.task.name}</h1>

      </div>

      <Motion.span 
        press={{scale: .9}}
        class="rounded-full bg-red-300 text-primary shadow-sm font-bold px-3 py-1 absolute top-3 right-3"
        onclick={() => setEditTask(props.task)}
      >
        Open
      </Motion.span>


      <AiFillPlayCircle
        class="fill-primary absolute bottom-2 right-[4.5rem]"
        size={30}
        onclick={() => setStartTime()}
      />

      <AiFillPlusCircle 
        class="fill-primary absolute bottom-2 right-10"
        size={30}
        onclick={() => changeDuration(.25)}
      />

      <AiFillMinusCircle
        class="fill-primary absolute bottom-2 right-2"
        size={30}
        onclick={() => changeDuration(-.25)}
      />

      <h3>{getTime(props.task.time!) + "-" + getTime(props.task.time! + duration())}</h3>


      <div class="flex flex-row items-center justify-center gap-2">
        <FaSolidHourglassEnd class="fill-primary" size={20} />
        <h2>{props.task.duration != null ? (props.task.duration < 1 ? props.task.duration * 60 + "min" : props.task.duration + "h") : null}</h2>
      </div>

    </Motion.div>
  )
}

// const addInitialTasks = () => {
//   const tasks = getTasks()
//   if (!tasks) {
//     setTasks(initialTasks)
//     return
//   }
//   setTasks([...tasks, ...initialTasks])
// }

// const initialTasks: Task[] = [ // TODO: Change this to be a map from the database
//   {
//     id: crypto.randomUUID(),
//     name: "Walk the dog",
//     date: new Date(),
//     time: 2,
//     completed: false,
//     priority: 1,
//     duration: 2,
//     description: "Walk the dog for 30 minutes"
//   },
//   {
//     id: crypto.randomUUID(),
//     name: "Walk the dog",
//     date: new Date(),
//     completed: false,
//     priority: 1,
//     duration: 2,
//     time: null,
//     description: "Walk the dog for 30 minutes"
//   },
//   {
//     id: crypto.randomUUID(),
//     name: "Walk the dog fjdask",
//     date: new Date(),
//     completed: false,
//     time: null,
//     priority: 1,
//     duration: 2,
//     description: "Walk the dog for 30 minutes"
//   },
//   {
//     id: crypto.randomUUID(),
//     name: "Do the dishes",
//     date: (() => {
//       const date = new Date()
//       date.setDate(date.getDate() + 1)
//       return date
//     })(),
//     completed: false,
//     priority: 1,
//     time: null,
//     duration: 1,
//     description: "Do the dishes for 30 minutes"
//   },
//   {
//     id: crypto.randomUUID(),
//     name: "Dishes",
//     date: (() => {
//       const date = new Date()
//       date.setDate(date.getDate() + 1)
//       return date
//     })(),
//     completed: false,
//     priority: 1,
//     duration: 1,
//     time: 9.5,
//     description: "Do the dishes for 30 minutes"
//   },
//   {
//     id: crypto.randomUUID(),
//     name: "Task 3",
//     date: new Date(),
//     completed: false,
//     time: 10,
//     priority: 1,
//     duration: 1,
//     description: "Task 3 for 30 minutes"
//   },
//   {
//     id: crypto.randomUUID(),
//     name: "Task 4",
//     time: 12,
//     date: new Date(),
//     completed: false,
//     priority: 1,
//     duration: 2,
//     description: "Task 3 for 30 minutes"
//   },
// ]
