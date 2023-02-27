import { Session } from "@supabase/supabase-js";

import { Motion } from "@motionone/solid"

import { animate, spring } from "motion";
import Header from "./components/Header";
import { FaRegularCalendar, FaRegularFlag, FaRegularSquareCheck, FaSolidCircleInfo, FaSolidPlus, FaSolidSquareCheck } from "solid-icons/fa";
import { createEffect, createMemo, createSignal, For, JSXElement, onMount, Show } from "solid-js";

import { createStore } from "solid-js/store";

import { AiOutlineClockCircle, AiOutlineHourglass, AiOutlineUnorderedList } from "solid-icons/ai";
import CreateTask from "./CreateTask";
import { BsStar } from "solid-icons/bs";
import DatePicker from "./components/DatePicker";
import { v4 as randomUUID } from 'uuid';
import { supabase } from "./database/supabaseClient";
import { getTasksFromDB } from "./database/databaseFunctions";
import { newNotification } from "./App";
import Notification from "./components/Notification";
import EditTask from "./EditTask";


const [sortedTasks, setSortedTasks] = createSignal(Array<Task[]>(4)) // TODO: Make this into a better data structure
const [allTasks, setAllTasks] = createSignal<Task[]>()

const [creatingTask, setCreatingTask] = createSignal(false)
const [activeTask, setActiveTask] = createSignal<Task | null>(null)

export default function(props: {session: Session}) {
  const months = ["January ", "February ", "March ", "April ", "May ", "June ", "July ", "August ", "September ", "October ", "November ", "December"]

  const [ref, setRef] = createSignal<HTMLElement | null>(null)

  createEffect(() => ref()?.scrollIntoView({block: "center"}))


  const getPlannedTasksFromDB = async () => {
    const {data: databaseTasks, error} = await getTasksFromDB(props.session)
    if (error) {
      console.log(error)
      newNotification(<Notification type="error" text="Error Getting tasks" />) // TODO: Add this functionality to the databasefuntions module
      return
    }
    const todaysTasks = (databaseTasks ?? []).filter(task => task.date.toDateString() === new Date().toDateString()) // The days are equal

    setAllTasks(todaysTasks)

    const grouped: Task[][] = todaysTasks
    .reduce((acc, task) => {acc[task.priority - 1] ? acc[task.priority - 1].push(task) : acc[task.priority - 1] = [task]; return acc}, new Array<Task[]>(4))

    setSortedTasks(grouped)
  }
  onMount(getPlannedTasksFromDB)


  return (
    <div class="pt-40">

      <CreateTask onDBChange={getPlannedTasksFromDB} show={creatingTask()} session={props.session} close={() => setCreatingTask(false)}/>
      <EditTask onDBChange={() => getPlannedTasksFromDB()} session={props.session} task={activeTask()!} show={activeTask() !== null} close={() => setActiveTask(null)} />

      <Header>
        <h1 
          class="text-primary text-4xl font-black"
          style={{
            "text-shadow": "0px 0px 10px rgba(0, 0, 0, 0.25)"
          }}
        >{months[new Date().getMonth()] + " " + new Date().getDate()}</h1>
        <h3 class="text-secondary font-bold">Hi {props.session.user.email}, let's plan your day</h3>

        <FaSolidCircleInfo size={30} class="fill-primary absolute right-6 top-12" />
      </Header>

      <div ref={setRef} class="grid grid-cols-2 gap-2 mt-5 px-3">
        <PlanningIndicators />

      </div>

      <div class="flex flex-row justify-start items-center gap-2 mt-5 px-8">
        <AddTaskButton onClick={() => setCreatingTask(true)}>Add Task</AddTaskButton>
      </div>

      <div class="rounded-tl-3xl rounded-tr-3xl bg-background-secondary mt-5 min-h-screen"> {/* TODO: Fix this height? */}
        <div class="flex flex-row justify-start gap-2 items-center p-5">
          <FaRegularSquareCheck size={30} />
          <h1 class="text-2xl font-bold text-primary">Your tasks for today</h1>
        </div>


        <PriorityLabel importance="High" urgency="High" />
        <Tasks filteredTasks={sortedTasks()[3]} />

        <PriorityLabel importance="High" urgency="Low" />
        <Tasks filteredTasks={sortedTasks()[2]} />

        <PriorityLabel importance="Low" urgency="High" />
        <Tasks filteredTasks={sortedTasks()[1]} />

        <PriorityLabel importance="Low" urgency="Low" />
        <Tasks filteredTasks={sortedTasks()[0]} />

      </div>
    </div>
  )
}


function AddTaskButton(props: {children: JSXElement, onClick: () => void}) {
  return (
    <div onClick={props.onClick} class="rounded-full px-3 py-1 flex-row flex items-center justify-center gap-2 bg-background-secondary border-2 border-neutral-300 shadow-md font-semibold text-xl text-primary">
      <FaSolidPlus size={20} class="fill-primary" />
      {props.children}
    </div>
  )
}

type Level = "High" | "Low"
function PriorityLabel(props: {importance: Level, urgency: Level}) {
  return (
    <div class="flex justify-start mt-2 px-5 -mb-6 items-center gap-2">
      <div class="bg-white text-secondary p-2 px-2 rounded-full shadow-sm"> 
        {props.importance} Importance
      </div>
      <div class="bg-white text-secondary p-2 px-2 rounded-full shadow-sm"> 
        {props.importance} Urgency
      </div>
    </div>
  )
}

function Tasks(props: {filteredTasks: Task[]}) {


  const testTasks: Task[] = [ 
    {
      id: randomUUID(),
      date: new Date(),
      name: "Test Task",
      description: "This is a test task",
      time: 1,
      duration: 2,
      priority: 3,
      completed: false
    },
    {
      id: randomUUID(),
      date: new Date(),
      name: "USACO",
      description: "Do USACO practice",
      time: 1,
      duration: 2,
      priority: 3,
      completed: false
    },
    {
      id: randomUUID(),
      date: new Date(),
      name: "USACO",
      description: "Do USACO practice",
      time: 1,
      duration: 2,
      priority: 3,
      completed: false
    },
  ]

  return (
    <div class="grid grid-flow-col justify-start gap-3 mt-5 px-5 py-5 overflow-x-scroll">
      <For each={props.filteredTasks}>
        {(task) => <TaskDisplay task={task} />}
      </For>
    </div>
  )
}

function TaskDisplay(props: {task: Task}) {
  const date = () => props.task.date.getDate() === new Date().getDate() ? "Today" : props.task.date.getDate() + " " + props.task.date.getMonth()

  // TODO: Figure out subtasks
  return (
    <Motion.div

      transition={{
        duration: .3,
        easing: spring()
      }}

      animate={{
        scale: [.9, 1],
        opacity: [0, 1],
        width: ["0%", "190px"]
      }}

      press={{
        scale: [.9]
      }}

      class="rounded-2xl shadow-lg bg-white h-36 w-44"
      onclick={() => setActiveTask(props.task)}
    >
      <div class="flex flex-row justify-start items-center gap-2 px-3 mt-2 mb-1">
        <FaRegularFlag size={18} class="fill-red-400" />
        <div class="flex flex-row items-center justify-center px-3 py-1 gap-2 bg-neutral-100 rounded-full text-secondary text-sm">
          <FaRegularCalendar size={18} class="fill-secondary" />
          {date()}
        </div>
      </div>

      <h1 class="mx-auto px-2">{props.task.name}</h1>

      <p class="text-secondary px-2">{props.task.description}</p>

      <div class="flex flex-row justify-start items-center gap-2 px-3 mt-2 mb-1">
        <div class="flex flex-row items-center justify-center px-3 py-1 gap-1 bg-neutral-100 rounded-full text-secondary">
          <AiOutlineHourglass size={18} class="fill-secondary" />
          {props.task.duration !== null ? (props.task.duration < 1 ? props.task.duration * 60 + "min" : props.task.duration + "h") : null}
        </div>
      </div>
    </Motion.div>
  )
}

type Indicatorsection = {
  startPercentage?: number,
  endPercentage: number,
  color: ((end: number) => string) | (() => string)
}

function PlanningIndicator(props: {icon: JSXElement, class?: string, description: JSXElement, indicatorsections: Indicatorsection[]}) {
  const sortedIndicatorSections = createMemo(() => props.indicatorsections.sort((a, b) => a.endPercentage - b.endPercentage))

  return (

    <div class={ "rounded-lg bg-background-secondary px-2 py-2 " + props.class }>
      <div class="flex flex-row justify-start items-center gap-1 text-[10px] text-secondary">
        {props.icon}
        {props.description}
      </div>

      <div class="w-[90%] bg-white rounded-full h-2 mx-auto mt-1 flex flex-row">
        <For each={sortedIndicatorSections()}>
          {(item, index) => 
            <Motion.div
              transition={{duration: 0.5}}
              animate={{
                width: [0, `${item.endPercentage - (item.startPercentage ?? props.indicatorsections[index() - 1]?.endPercentage ?? 0)}%`]
              }}
              class="h-2"
              style={{
                "background-color": item.color(item.endPercentage),
              }}
              classList={{
                "rounded-l-full": index() === 0,
                "rounded-r-full": item.endPercentage === 100
              }}
            />
          }
        </For>
      </div>
    </div>
  )
}

function PlanningIndicators() {

  const percentageSteps = createMemo(() => {
    if (!allTasks()) return null

    const numTasksWithSteps = allTasks()!.filter((task) => task.steps?.length && task.steps?.length > 0).length
    return Math.round(numTasksWithSteps / allTasks()!.length * 100)
  })

  const percentageTasksWithMeaning = createMemo(() => {
    if (!allTasks()) return null

    const numTasksWithMeaning = allTasks()!.filter((task) => task.description).length
    return Math.round(numTasksWithMeaning / sortedTasks().flat().length * 100)
  })

  const calculateOrderIndicatorSections = createMemo(() => {
    if (!allTasks()) return null
    const totalDuration = allTasks()!.reduce((acc, task) => acc + task.duration!, 0)
    const indicatorSections: Indicatorsection[] = allTasks()!
    .slice()
    .filter(task => task.time !== null)
    .sort((a, b) =>  b.time! - a.time!) // TODO: Adjust for errors
    .map((task, index) => {
      const startPercentage = index === 0 ? 0 : allTasks()!.slice(0, index).reduce((acc, task) => acc + task.duration!, 0) / totalDuration * 100
      const endPercentage = task.duration! / totalDuration * 100 + startPercentage

      console.log(startPercentage, endPercentage)
      console.log(task.priority)

      return {
        startPercentage,
        endPercentage,
        color: () => task.priority === 4 ? "red" : task.priority === 3 ? "yellow" : task.priority === 2 ? "lightblue" : "lightgray"
      }
    })
    return indicatorSections
  })

  const totalDuration = createMemo(() => {
    if (!allTasks()) return null
    const totalTimeHours = allTasks()!.reduce((acc, task) => acc + task.duration!, 0)
    const totalHours = Math.floor(totalTimeHours)
    const totalMinutes = Math.round((totalTimeHours - totalHours) * 60)
    return totalHours + ":" + (totalMinutes < 10 ? "0" + totalMinutes : totalMinutes)
  })

  return (
    <>
      <PlanningIndicator
        icon={<AiOutlineUnorderedList size={16} class="fill-primary" />} 
        description={<><strong class="text-primary font-extrabold">{percentageSteps() ?? 0}%</strong> of tasks have a plan</>} 
        indicatorsections={[
          {color: (endPercentage: number) => endPercentage > 80 ? "lightgreen" : "lightgray", endPercentage: percentageSteps()},
        ]}
      />

      <PlanningIndicator
        icon={<BsStar size={16} class="fill-primary" />} 
        description={<><strong class="text-primary font-extrabold">{percentageTasksWithMeaning() ?? 0}%</strong> of tasks have meaning</>} 
        indicatorsections={[
          {color: (endPercentage: number) => endPercentage > 80 ? "lightgreen" : "lightgray", endPercentage: percentageTasksWithMeaning() ?? 0},
        ]}
      />
      <PlanningIndicator
        class="col-span-2"
        icon={<AiOutlineClockCircle size={20} class="fill-primary" />} 
        description={<p class="text-lg"><strong class="text-primary font-extrabold text-xl">{totalDuration()}</strong> of tasks planned</p>} 
        indicatorsections={
          calculateOrderIndicatorSections() ?? []
        }
      />
    </>
  )

}
