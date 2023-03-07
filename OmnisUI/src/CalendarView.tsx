import { FaRegularSquareCheck, FaSolidHourglassEnd, FaSolidSquareCheck } from "solid-icons/fa"
import { BiRegularCheckbox, BiSolidCheckboxChecked } from 'solid-icons/bi'
import { Accessor, createEffect, createMemo, createResource, createSignal, For, onMount, Show, untrack } from "solid-js"

import { AiFillCloseCircle, AiFillMinusCircle, AiFillPlayCircle, AiFillPlusCircle, AiFillStop, AiOutlineCaretUp } from 'solid-icons/ai'
import { Session } from "@supabase/supabase-js"
import { Motion, Presence } from "@motionone/solid"
import { spring } from "motion"
import EditTask from "./EditTask"

import {newNotification} from "./App"
import Notification from "./components/Notification"
import { deleteDBCompletedTasks, deleteDBWorkingTasks, getTasksFromDB, upsertCompletedTasks, upsertTasks, upsertWorkingTask } from "./utils/database/databaseFunctions"
import { scheduleTasks } from "./utils/schedulingFunctions"
import { BsStopCircleFill } from "solid-icons/bs"
import { Completable, CompletedTask, Scheduleable, ScheduledTask, WorkingTask } from "./utils/taskStates"





// TODO: change to a solid js resource
const updateTasksWithDatabase = async (session: Session) => {
  const {data, error} = await getTasksFromDB(session)
  if (!data) return

  const {unscheduledTasks, completedTasks, workingTask: workingTasks} = data

  if (error) {
    console.log(error.message)
    newNotification(<Notification type="error" text="Failed to load tasks" />)
    return
  }

  setUnscheduledTasks(unscheduledTasks ?? undefined) // TODO: This is such good cod3; don't fix it pls
  setWorkingTask(workingTasks)
  setCompletedTasks(completedTasks ?? undefined)
}

const updateDBWithTasks = async (tasks: UnscheduledTask[], session: Session) => {

  const {data, error} = await upsertTasks(tasks, session)
  console.log(data, error)
}



// All of the unscheudled tasks that will be scheduled and displayed
const [unscheduledTasks, setUnscheduledTasks] = createSignal<UnscheduledTask[]>()

// The current working task
const [workingTask, setWorkingTask] = createSignal<WorkingTask | null>(null)

// The completed tasks
const [completedTasks, setCompletedTasks] = createSignal<CompletedTask[]>()


let activeTimeRef: HTMLDivElement;

/** The scale of 1hr in pixels */
const [get1hScale, setScale] = createSignal(150)


// ---------------------------- User task operations -------------------------
// TODO: fix this bad types
const completeTask = (task: Completable) => {
  // TODO: handle scheudledTask
  setUnscheduledTasks(unscheduledTasks()?.filter(t => t.id !== task.task.task.id))
  if (task instanceof WorkingTask) setWorkingTask(null)
  setCompletedTasks([...completedTasks() ?? [], task.completed_task()])
}

const uncompleteTask = (task: CompletedTask) => {
// TODO: Check if task was a working task? Handle this?
  setUnscheduledTasks([...unscheduledTasks() ?? [], task.uncompleted()])
  setCompletedTasks(completedTasks()?.filter(t => t.task.task.id !== task.task.task.id))
}

// TODO: only able to have 1 working task at once
const startTask = (task: ScheduledTask) => {
  if (workingTask() !== null) stopTask(workingTask()!)

  // remove from unscheduled tasks
  setUnscheduledTasks(unscheduledTasks()?.filter(t => t.id !== task.task.task.id)) // TODO: Use the solid apis for this

  // Set and remove the old working task
  setWorkingTask(task.started())
}

const stopTask = (task: WorkingTask) => {
  setUnscheduledTasks([...unscheduledTasks() ?? [], task.stoped()])
  setWorkingTask(null)
}



const [day, setDay] = createSignal<Date>(new Date)
const changeDay = (amount: number) => {
  const newDate = new Date(day())
  newDate.setDate(newDate.getDate() + amount)
  setDay(newDate)
}


// The task that is currently being edited in the popup view
const [editTask, setEditTask] = createSignal<UnscheduledTask | null>(null)


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

  // Sync unscheduled user tasks with database. This will not delete
  createEffect(() => {
    if (!unscheduledTasks()) return

    updateDBWithTasks(unscheduledTasks()!, props.session)
  })

  createEffect<WorkingTask | null>((prev) => {
    const task = workingTask()

    console.log("Prev", prev)
    if (prev) {
      console.log("Working Removed", prev)
      deleteDBWorkingTasks(prev)
    }

    if (task) upsertWorkingTask(task, props.session)

    // return the last computed value to calculate the diffs in the futue
    return task
  }, workingTask())

  createEffect<CompletedTask[] | undefined>((prev) => {
    const tasks = completedTasks()
    if (!tasks) return

    // find removed completed tasks and remove them from database
    const removed = prev?.filter(t => !tasks.find(t2 => t2.task.task.id === t.task.task.id))
    if (removed && removed?.length !== 0) {
      console.log("Completed Removed", removed)
      deleteDBCompletedTasks(removed)
    }

    upsertCompletedTasks(tasks, props.session)

    // return the last computed value to calculate the diffs in the futue
    return tasks
  })

  /** Schedules that unscheudled tasks using the working and completed tasks as obstacles */
  async function getScheduledTasks(args: {unscheduled: UnscheduledTask[] | undefined, completed: CompletedTask[] | undefined, working: WorkingTask | null}) {
    const {unscheduled, completed, working} = args
    if (!unscheduled) return
    const scheduledTasks = await scheduleTasks(
      unscheduled,
      [
        completed?.map(t => { return {
          start_time: t.start_time, 
          end_time: t.end_time
        } }) ?? [],
        working !== null ? [{
          start_time: working.start_time,
          end_time: (() => {const d = new Date(working.scheduled_datetime); d.setMinutes(d.getMinutes() + working.task.task.duration!); return d})()
        }] : []
      ].flat()
    )

    return scheduledTasks

    // const [durationTasks, nonDurationTasks] = unscheduled.reduce((prev, task) => {
    //   if (task.duration !== null) {
    //     prev[0].push(task)
    //   } else {
    //     prev[1].push(task)
    //   }
    //   return prev
    // }, [new Array<UnscheduledTask>(), new Array<UnscheduledTask>()])


    // const nonDurationTasksScheduled: ScheduledTask[] = nonDurationTasks.map(t => {
    //   return {
    //     task: {
    //       task: t,
    //       urgency: "Low"
    //     },
    //     scheduled_datetime: new Date(),
    //     state: "Scheduled"
    //   }
    // })


    // return [await scheduleTasks(durationTasks, [
    //   completed?.map(t => {return {start_time: t.start_time, end_time: t.end_time}}) ?? [],
    //   working?.map(t => {return {start_time: t.scheduled_datetime, end_time: (() => {const d = new Date(t.scheduled_datetime); d.setMinutes(d.getMinutes() + t.task.task.duration!); return d})()}}) ?? []
    // ].flat()),  nonDurationTasksScheduled   ].flat()
  }

  const tasks = () => {return {unscheduled: unscheduledTasks(), completed: completedTasks(), working: workingTask()}}
  const [autoscheduledTasks, {refetch: reschedule, mutate}] = createResource(tasks, getScheduledTasks)

  interface TodaysTasks {daily: ScheduledTask[], scheduled: ScheduledTask[], working: WorkingTask | null, completed: CompletedTask[]}  
  const todaysTasks = createMemo<TodaysTasks | undefined>(() => 
    [autoscheduledTasks() ?? [], workingTask() ?? [], completedTasks() ?? []].flat().reduce(
      (prev, task) => {
        const schedulableTask: Scheduleable = task
        if (schedulableTask.start_time.toDateString() !== day().toDateString()) return prev

        if (task instanceof ScheduledTask) prev.scheduled.push(task)
        else if (task instanceof WorkingTask) prev.working = task
        else if (task instanceof CompletedTask) prev.completed.push(task)

        // if (task.task.task.duration !==  null) {
        //   prev.scheduled.push(task)
        // } else {
        //   prev.daily.push(task)
        // }

        return prev
      }, 
      { daily: new Array<ScheduledTask>(), scheduled: new Array<ScheduledTask>(), working: null, completed: new Array<CompletedTask>() } as TodaysTasks // The initial
    )
  )

  // const dailyTasks = () => todaysTasks()?.daily
  const todaysScheduledTasks = () => todaysTasks()?.scheduled
  const todaysCompletedTasks = () => todaysTasks()?.completed
  const todaysWorkingTask = () => todaysTasks()?.working


  return (
    <div class="pt-40">

      <EditTask onDBChange={() => updateTasksWithDatabase(props.session)} session={props.session} task={editTask()!} show={editTask() !== null} close={() => setEditTask(null)} />

      {/*<CalendarHeader dailyTasks={dailyTasks()} /> */}
      <CalendarHeader />
      <CalendarBody scheduledTasks={todaysScheduledTasks()} workingTask={todaysWorkingTask()} completedTasks={todaysCompletedTasks()} />

    </ div>
  )
}

// function CalendarHeader(props: {dailyTasks?: ScheduledTask[]}) {
function CalendarHeader() {

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

      {/* TODO: Add this back
{props.dailyTasks !== undefined && props.dailyTasks.length && (<>
<div class="flex flex-row mt-3 w-10/12" classList={{"gap-2": !getDailyExpanded()}}>
<div class="flex-grow flex flex-col" classList={{"gap-1": props.dailyTasks?.length > 1, "gap-0": props.dailyTasks?.length <= 1}}>
<DailyTask task={props.dailyTasks[0]} show={true} />

<For each={props.dailyTasks.slice(1)} fallback={null}>
{(item) => (
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
*/}



    </div>
  )
}

// // TODO: fix this for other task states
// function DailyTask(props: {task: ScheduledTask | CompletedTask, show: boolean}) {
// 
//   return(
//     <div class="flex flex-row gap-2 justify-start items-center text-center h-8 bg-secondary p-2 rounded-lg transition-all"
//       onclick={() => setEditTask(props.task.task.task)} // The edit task does not take scheduled task bc it will be rescheudeld on change, so I will sent the unschedueld task version
// 
//       classList={{"opacity-0": !props.show}}
//     >
// 
//       { props.task.state === "Completed" ? // Add animations to this
//         <BiRegularCheckbox onclick={() => uncompleteTask(props.task as CompletedTask)} size={35} class='fill-primary' /> :
//         <BiSolidCheckboxChecked onclick={() => completeTask(props.task as ScheduledTask)} size={35} class='fill-primary' />
//       }
//       <h3>{props.task.task.task.name}</h3>
//     </div>
//   )
// }


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



function CalendarBody(props: {scheduledTasks?: ScheduledTask[], workingTask: WorkingTask | undefined | null, completedTasks?: CompletedTask[]}) {
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
        <For each={[props.scheduledTasks ?? [], props.workingTask ?? [], props.completedTasks ?? []].flat()} fallback={null}>
          {(item) => (
            <Event task={item} />
          )}
        </For>
      </div>
    </>
  )
}

function CalendarTimeLine() {
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
          "margin-top": minutes() * (get1hScale() / 60) - 5 + "px"
        }}
        class="flex flex-row h-[3px] bg-red-600 absolute w-full top-1">
      </div>
    </Show>
  )
}

function CalendarLine(props: {time: string}) {
  return (
    <div class="flex flex-row items-center mx-auto">
      <span style={{"margin-top": get1hScale() + "px"}} class="rounded-full absolute left-2 text-secondary basis-12 text-sm flex items-center justify-center">{props.time}</span>

      <div style={{"margin-top": get1hScale() - 2 + "px"}} class="w-[85%] ml-auto mr-2 h-[2px] bg-secondary"></div>
    </div>
  )
}


/** Only give on argument; I can't figure out how to do type checking so I have to do this shit */
function Event(props: {task: Scheduleable}) {

  const duration = () => (props.task.end_time.getTime() - props.task.start_time.getTime())/1000/60

  const startTime = () => (props.task.start_time.getHours() + props.task.start_time.getMinutes() / 60 + 1) * get1hScale()
  const height = () => duration() / 60 * get1hScale()

  const changeDuration = (amt: number) => {
    const tasks = unscheduledTasks()

    if (!tasks) {
      console.log("No tasks but adding 15 minutes?")
      return
    }

    if (props.task instanceof CompletedTask) return
    else if (props.task instanceof WorkingTask) {
      const workingTask = props.task
      setWorkingTask(workingTask.changed_duration(amt))
    } else if (props.task instanceof ScheduledTask) {
      const scheduledTask = props.task
      setUnscheduledTasks(unscheduledTasks()?.map(task => task.id === scheduledTask.task.task.id ? scheduledTask.changed_duration(amt).task.task : task))
    }
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

      class="absolute bg-opacity-80 border-2 flex flex-col justify-start py-3 items-start shadow-lg w-80 ml-12 rounded-xl overflow-y-hidden p-2 text-center"

      classList={{
        "border-green-400 bg-highlight": props.task instanceof CompletedTask,
        "border-red-300 bg-red-300": props.task.task.urgency === "High" && props.task.task.task.importance === "High" && !(props.task instanceof CompletedTask),
        "border-orange-300 bg-orange-300": props.task.task.urgency === "High" && props.task.task.task.importance === "Low" && !(props.task instanceof CompletedTask),
        "border-blue-300 bg-blue-300": props.task.task.urgency === "Low" && props.task.task.task.importance === "High" && !(props.task instanceof CompletedTask),
        "border-neutral-300 bg-neutral-300": props.task.task.urgency === "Low" && props.task.task.task.importance === "Low" && !(props.task instanceof CompletedTask),
      }}
    >
      <div class="flex w-full items-center justify-start">

        { props.task instanceof CompletedTask  ? // Add animations to this
          <BiSolidCheckboxChecked onclick={() => uncompleteTask(props.task as CompletedTask)} size={35} class='fill-primary' /> :
          <BiRegularCheckbox onclick={() => completeTask(props.task as ScheduledTask | WorkingTask)} size={35} class='fill-primary' />
        }

        <h1 class="flex items-center text-lg">{props.task.task.task.name}</h1>

      </div>

      <Motion.span 
        press={{scale: .9}}
        class="rounded-full bg-neutral-100 text-primary shadow-sm font-bold px-3 py-1 absolute top-3 right-3"
        onclick={() => setEditTask(props.task.task.task)}
      >
        Open
      </Motion.span>


      { props.task instanceof ScheduledTask ?
        <AiFillPlayCircle
          class="fill-primary absolute bottom-2 right-[4.5rem]"
          size={30}
          onclick={() =>  startTask(props.task as ScheduledTask)} // Bad JSX! Gimme my type checking!
        />
        : props.task instanceof WorkingTask ? 
          <AiFillCloseCircle 
            class="fill-primary absolute bottom-2 right-[4.5rem]"
            size={30}
            onclick={() => stopTask(props.task as WorkingTask)} // Same here!
          /> 
          : null
      }

      <Show when={props.task instanceof ScheduledTask || props.task instanceof WorkingTask}>
        <AiFillPlusCircle 
          class="fill-primary absolute bottom-2 right-10"
          size={30}
          onclick={() => changeDuration(15)}
        />

        <AiFillMinusCircle
          class="fill-primary absolute bottom-2 right-2"
          size={30}
          onclick={() => changeDuration(-15)}
        />
      </Show>

      <h3>{getTime(props.task.start_time.getHours() + props.task.start_time.getMinutes() / 60) + "-" + getTime(props.task.start_time.getHours() + props.task.start_time.getMinutes() / 60 + duration() / 60)}</h3>


      <div class="flex flex-row items-center justify-center gap-2">
        <FaSolidHourglassEnd class="fill-primary" size={20} />
        <h2>{props.task.task.task.duration != null ? (props.task.task.task.duration / 60 < 1 ? props.task.task.task.duration + "min" : props.task.task.task.duration / 60 + "h") : null}</h2> 
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

