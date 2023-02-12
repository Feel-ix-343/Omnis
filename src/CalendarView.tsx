import { BsCheck2Square, BsChevronRight, BsHourglass, BsHourglassSplit } from "solid-icons/bs"
import { FaRegularSquareCheck, FaSolidHourglass, FaSolidHourglassEnd, FaSolidSquareCheck } from "solid-icons/fa"
import { Accessor, createEffect, createMemo, createSignal, For, onMount } from "solid-js"
import {createStore} from 'solid-js/store'

import { AiOutlineCaretUp } from 'solid-icons/ai'
import { style } from "solid-js/web"

type Task = {
  id: string,
  name: string,
  date: Date,
  time?: number,
  duration?: number,
  completed: boolean,
  priority: number,
  description: string
}


// TODO: Get tasks from the database
const [getTasks, setTasks] = createSignal<Task[]>(
  [ // TODO: Change this to be a map from the database
    {
      id: crypto.randomUUID(),
      name: "Walk the dog",
      date: new Date(),
      time: 2,
      completed: false,
      priority: 1,
      duration: 2,
      description: "Walk the dog for 30 minutes"
    },
    {
      id: crypto.randomUUID(),
      name: "Walk the dog",
      date: new Date(),
      completed: false,
      priority: 1,
      duration: 2,
      description: "Walk the dog for 30 minutes"
    },
    {
      id: crypto.randomUUID(),
      name: "Walk the dog fjdask",
      date: new Date(),
      completed: false,
      priority: 1,
      duration: 2,
      description: "Walk the dog for 30 minutes"
    },
    {
      id: crypto.randomUUID(),
      name: "Do the dishes",
      date: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        return date
      })(),
      completed: false,
      priority: 1,
      duration: 1,
      description: "Do the dishes for 30 minutes"
    },
    {
      id: crypto.randomUUID(),
      name: "Dishes",
      date: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        return date
      })(),
      completed: false,
      priority: 1,
      duration: 1,
      time: 9.5,
      description: "Do the dishes for 30 minutes"
    },
    {
      id: crypto.randomUUID(),
      name: "Task 3",
      date: new Date(),
      completed: false,
      time: 10,
      priority: 1,
      duration: 1,
      description: "Task 3 for 30 minutes"
    },
    {
      id: crypto.randomUUID(),
      name: "Task 4",
      time: 12,
      date: new Date(),
      completed: false,
      priority: 1,
      duration: 2,
      description: "Task 3 for 30 minutes"
    },
  ]
)

let activeLineRef: HTMLDivElement;


const toggleCompleted = (task: Task) => {
  setTasks(getTasks().map(t => t.id === task.id ? {...t, completed: !t.completed} : t))
}


const [day, setDay] = createSignal<Date>(new Date)
const changeDay = (amount: number) => {
  const newDate = new Date(day())
  newDate.setDate(newDate.getDate() + amount)
  setDay(newDate)
}

export default function CalendarView() {

  onMount(() => {
    activeLineRef.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
  })


  createEffect(() => {
    // Sync with the database
    console.log(getTasks())
  })

  const tasks = createMemo<[Task[], Task[]]>(() => getTasks().reduce<[Task[], Task[]]>((prev, task) => {
    if (task.date.getDate() !== day().getDate()) return prev

    if (task.time !==  undefined) {
      prev[1].push(task)
    } else {
      prev[0].push(task)
    }
    return prev
  }, [[], []]))

  const dailyTasks = () => tasks()[0]
  const scheduledTasks = () => tasks()[1]

  console.log(dailyTasks(), scheduledTasks())

  return (
    <div class="pt-40">

      <CalendarHeader dailyTasks={dailyTasks()} />
      <CalendarBody tasks={scheduledTasks()} />

    </ div>
  )
}

function CalendarHeader(props: {dailyTasks?: Task[]}) {

  const [getDailyExpanded, setDailyExpanded] = createSignal(false)

  const dayOfMonth = () => day().getDate()

  const dayAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  // TODO: fix this and negative indexes

  const dates: Accessor<{date: number, day: string}[]> = createMemo(() => {
    const dates = []
    for (let i = -2; i <= 2; i++) {
      const date = new Date(day())
      date.setDate(date.getDate() + i)
      dates.push({date: date.getDate(), day: dayAbbreviations[date.getDay()]})
    }
    return dates
  })

  return (
    <div 
      class="z-10 w-full bg-background-secondary rounded-b-3xl shadow-lg flex flex-col items-center pt-10 pb-3 fixed top-0 transition-all overflow-y-hidden" 
      classList={{"max-h-full": getDailyExpanded(), "max-h-[185px]": !getDailyExpanded()}}
    >
      <div class="flex flex-row gap-2 items-center justify-center">
        <CalendarDate date={dates()[0].date} click={() => changeDay(-2)} day={dates()[0].day}/>
        <CalendarDate date={dates()[1].date} click={() => changeDay(-1)} day={dates()[1].day}/>
        <CalendarDate date={dates()[2].date} day={dates()[2].day} focus={true}/>
        <CalendarDate date={dates()[3].date} click={() => changeDay(+1)} day={dates()[3].day}/>
        <CalendarDate date={dates()[4].date} click={() => changeDay(+2)} day={dates()[4].day}/>
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
      classList={{"opacity-0": !props.show}}>
      {props.task?.completed ?  // Why is this coming as undefiend? dang javascript
        <FaSolidSquareCheck onclick={() => toggleCompleted(props.task)} size={20} class="fill-primary" /> :
        <FaRegularSquareCheck onclick={() => toggleCompleted(props.task)} size={20} class="fill-primary" />
      }
      <h3>{props.task.name}</h3>
    </div>
  )
}


function CalendarDate(props: {date: number, click?: () => void, day: string, focus?: boolean}) {
  return (
    <div 
      class="flex flex-col justify-center items-center bg-white text-center p-3 rounded-xl shadow-md border-[2px] "
      classList={{
        "bg-highlight border-green-400 w-20": props.focus,
        "border-gray-200 w-14": !props.focus,
        "active:scale-[85%] transition-all": props.click !== undefined
      }}
      onclick={props.click}
    >
      <div class={ "text-gray-500 " + (props.focus ? "font-extrabold text-3xl text-gray-700" : "text-xl") }>{props.date}</div>
      <div class={ "text-gray-500 " + (props.focus ? "text-xl font-bold text-gray-700" : null)}>{props.day}</div>
    </div>
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

        <Time />
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

function Time() {
  const date = new Date;

  const [minutes, setMinutes] = createSignal<number>(date.getMinutes() + (date.getHours() * 60))

  setInterval(() => {
    const date = new Date;
    setMinutes(date.getMinutes() + (date.getHours() * 60))
  }, 30000)

  return (
    <div
      ref={activeLineRef}
      style={{
        "margin-top": minutes() + "px"
      }}
      class="flex flex-row h-[3px] bg-red-600 absolute w-full top-14 mt-[60px]">
    </div>
  )
}

function CalendarLine(props: {time: string}) {
  return (
    <div class="flex flex-row items-center justify-center">
      <span class="rounded-full text-secondary mt-10 basis-12 text-sm">{props.time}</span>
      <div class="w-full h-[2px] mt-[58px] bg-secondary"></div>
    </div>
  )
}

function Event(props: {task: Task}) {
  if (props.task.time === undefined) return null

  const duration = () => props.task.duration ?? .5

  const startTime = () => (props.task.time + 1) * 60
  const height = () => duration() * 60

  const add15 = () => {
    setTasks(getTasks().map(task => task.id === props.task.id && task.duration !== undefined ? {...task, duration: task.duration + .25} : task))
  }

  return (
    <div 
      style={{
        "margin-top": `${startTime()}px`,
        "height": `${height()}px`
      }}
      class="absolute bg-opacity-80 flex flex-col justify-start py-3 items-start shadow-lg border-red-300 border-2 bg-red-300 w-80 ml-12 rounded-xl overflow-y-hidden p-2 text-center transition-all"
    >
      <div class="flex gap-3 w-full items-start">

        { !props.task.completed ? // Add animations to this
          <FaRegularSquareCheck onclick={() => toggleCompleted(props.task)} size={30} class='fill-primary' /> :
          <FaSolidSquareCheck onclick={() => toggleCompleted(props.task)} size={30} class='fill-primary' />
        }

        <h1 class="flex items-center">{props.task.name}</h1>

        <div 
          class="bg-white ml-auto border-2 border-neutral-300 shadow-md flex justify-center items-center h-8 rounded-full px-3 active:scale-90 transition-all"
          onclick={() => add15()}
        >+ 15min</div>
      </div>
      <h3>{props.task.time + ":00-" + (props.task.time + duration()) + ":00"}</h3>
      <div class="flex flex-row items-center justify-center gap-2">
        <FaSolidHourglassEnd class="fill-primary" size={20} />
        <h2>{props.task.duration}h</h2>
      </div>

    </div>
  )
}
