import { Session } from "@supabase/supabase-js";

import { Motion } from "@motionone/solid"

import { animate, spring } from "motion";
import Header from "./components/Header";
import { FaRegularCalendar, FaRegularFlag, FaRegularSquareCheck, FaSolidCircleInfo, FaSolidPlus, FaSolidSquareCheck } from "solid-icons/fa";
import { createEffect, createMemo, createResource, createSignal, For, JSXElement, onMount, Show } from "solid-js";

import { createStore } from "solid-js/store";

import { AiOutlineClockCircle, AiOutlineHourglass, AiOutlineUnorderedList } from "solid-icons/ai";
import CreateTask from "./CreateTask";
import { BsStar } from "solid-icons/bs";
import DatePicker from "./components/DatePicker";
import { v4 as randomUUID } from 'uuid';
import { supabase } from "./utils/database/supabaseClient";
import { getTasksFromDB } from "./utils/database/databaseFunctions";
import { newNotification } from "./App";
import Notification from "./components/Notification";
import EditTask from "./EditTask";
import { scheduleTasks } from "./utils/schedulingFunctions";
import { ScheduledTask } from "./utils/taskStates";


const [session, setSession] = createSignal<Session>()

// Get all tasks from the DB. This will then be used to schedule the tasks, then filtere for the day, then display
const getAllTasksFromDB = async (session: Session | undefined) => {
  if (!session) return

  const {data: databaseTasks, error} = await getTasksFromDB(session)
  if (error) {
    console.log(error)
    newNotification(<Notification type="error" text="Error Getting tasks" />) // TODO: Add this functionality to the databasefuntions module
    return
  }

  return databaseTasks?.unscheduledTasks ?? []
}
const [getAllTasks, {mutate: mutateDB, refetch: refetchDB}] = createResource(session, getAllTasksFromDB)





// Schedule the tasks
async function getScheduledTasks(tasks: UnscheduledTask[] | undefined) {
  if (!tasks) return

  const durationTasks = tasks.filter(task => task.duration !== null)
  return await scheduleTasks(durationTasks, []) // TODO: Why does this work
}
const [autoscheduledTasks] = createResource(getAllTasks, getScheduledTasks)






const todaysTasks = createMemo<ScheduledTask[]>(() => {
  const tasks = autoscheduledTasks()
  console.log(tasks)
  // TODO: Change this to use the start ddate of the task, not he scheudled date
  return tasks?.filter(task => task.scheduled_datetime.toDateString() === new Date().toDateString()) ?? [] // Tasks for today
})


const sortedTasks = createMemo<readonly [ScheduledTask[], ScheduledTask[], ScheduledTask[], ScheduledTask[]]>(() => {
  const tasks = todaysTasks()
  return [
    tasks.filter(t => t.task.task.importance === "High" && t.task.urgency === "High"),
    tasks.filter(t => t.task.task.importance === "High" && t.task.urgency === "Low"),
    tasks.filter(t => t.task.task.importance === "Low" && t.task.urgency === "High"),
    tasks.filter(t => t.task.task.importance === "Low" && t.task.urgency === "Low")
  ] as const
})

const [creatingTask, setCreatingTask] = createSignal(false)
const [activeTask, setActiveTask] = createSignal<UnscheduledTask | null>(null)


export default function(props: {session: Session}) {
  onMount(() => setSession(props.session))
  onMount(refetchDB)
  const months = ["January ", "February ", "March ", "April ", "May ", "June ", "July ", "August ", "September ", "October ", "November ", "December"]

  const [ref, setRef] = createSignal<HTMLElement | null>(null)

  createEffect(() => ref()?.scrollIntoView({block: "center"}))

  return (
    <div class="pt-40">

      <CreateTask onDBChange={refetchDB} show={creatingTask()} session={props.session} close={() => setCreatingTask(false)}/>
      <EditTask onDBChange={refetchDB} session={props.session} task={activeTask()!} show={activeTask() !== null} close={() => setActiveTask(null)} />

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
        <Tasks filteredTasks={sortedTasks()[0]} />

        <PriorityLabel importance="High" urgency="Low" />
        <Tasks filteredTasks={sortedTasks()[1]} />

        <PriorityLabel importance="Low" urgency="High" />
        <Tasks filteredTasks={sortedTasks()[2]} />

        <PriorityLabel importance="Low" urgency="Low" />
        <Tasks filteredTasks={sortedTasks()[3]} />

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
        {props.urgency} Urgency
      </div>
    </div>
  )
}

function Tasks(props: {filteredTasks: ScheduledTask[]}) {
  return (
    <div class="grid grid-flow-col justify-start gap-3 mt-5 px-5 py-5 overflow-x-scroll">
      <For each={props.filteredTasks}>
        {(task) => <TaskDisplay task={task} />}
      </For>
    </div>
  )
}

function TaskDisplay(props: {task: ScheduledTask}) {
  const date = () => props.task.task.task.due_date.getDate() === new Date().getDate() ? "Today" : props.task.task.task.due_date.getDate() + " " + props.task.task.task.due_date.getMonth()

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
      onclick={() => setActiveTask(props.task.task.task)}
    >
      <div class="flex flex-row justify-start items-center gap-2 px-3 mt-2 mb-1">
        <FaRegularFlag size={18} class="fill-red-400" />
        <div class="flex flex-row items-center justify-center px-3 py-1 gap-2 bg-neutral-100 rounded-full text-secondary text-sm">
          <FaRegularCalendar size={18} class="fill-secondary" />
          {date()}
        </div>
      </div>

      <h1 class="mx-auto px-2">{props.task.task.task.name}</h1>

      <p class="text-secondary px-2">{props.task.task.task.description}</p>

      <div class="flex flex-row justify-start items-center gap-2 px-3 mt-2 mb-1">
        <div class="flex flex-row items-center justify-center px-3 py-1 gap-1 bg-neutral-100 rounded-full text-secondary">
          <AiOutlineHourglass size={18} class="fill-secondary" />
          {props.task.task.task.duration !== null ? (props.task.task.task.duration / 60 < 1 ? props.task.task.task.duration + "min" : props.task.task.task.duration / 60 + "h") : null}
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
    if (!todaysTasks()) return null

    const numTasksWithSteps = todaysTasks()!.filter((task) => task.task.task.steps?.length && task.task.task.steps?.length > 0).length
    return Math.round(numTasksWithSteps / todaysTasks()!.length * 100)
  })

  const percentageTasksWithMeaning = createMemo(() => {
    if (!todaysTasks()) return null

    const numTasksWithMeaning = todaysTasks()!.filter((task) => task.task.task.description).length
    return Math.round(numTasksWithMeaning / sortedTasks().flat().length * 100)
  })

  const calculateOrderIndicatorSections = createMemo(() => {
    if (!todaysTasks()) return null
    const totalDuration = todaysTasks()!.reduce((acc, task) => acc + task.task.task.duration!, 0)
    const indicatorSections: Indicatorsection[] = todaysTasks()!
    .slice()
    .filter(task => task.scheduled_datetime !== null)
    .sort((a, b) =>  a.scheduled_datetime.getTime() - b.scheduled_datetime.getTime()) // Sort by earliest to latest
    .map((task, index) => {
      const startPercentage = index === 0 ? 0 : todaysTasks()!.slice(0, index).reduce((acc, task) => acc + task.task.task.duration!, 0) / totalDuration * 100
      const endPercentage = task.task.task.duration! / totalDuration * 100 + startPercentage

      console.log(startPercentage, endPercentage)

      return {
        startPercentage,
        endPercentage,
        color: () => 
          task.task.task.importance === "High" && task.task.urgency === "High" ? "#ef4444" : 
            task.task.task.importance === "High" && task.task.urgency === "Low" ? "#fb923c" :
              task.task.task.importance === "Low" && task.task.urgency === "High" ? "#0ea5e9" :
                "lightgray"
      }
    })
    return indicatorSections
  })

  const totalDuration = createMemo(() => {
    if (!todaysTasks()) return null
    const totalTimeHours = todaysTasks()!.reduce((acc, task) => acc + task.task.task.duration! / 60, 0)
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
          {color: (endPercentage: number) => endPercentage > 80 ? "lightgreen" : "lightgray", endPercentage: percentageSteps() ?? 0},
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
