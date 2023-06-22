import { Session } from "@supabase/supabase-js";

import { Motion } from "@motionone/solid"

import { animate, spring } from "motion";
import { FaRegularCalendar, FaRegularFlag, FaRegularSquareCheck, FaSolidBrain, FaSolidCircleInfo, FaSolidPaperPlane, FaSolidPlus, FaSolidSquareCheck } from "solid-icons/fa";
import { createEffect, createMemo, createResource, createSignal, For, JSXElement, onMount, Show } from "solid-js";

import { createStore } from "solid-js/store";

import { AiOutlineClockCircle, AiOutlineHourglass, AiOutlineUnorderedList } from "solid-icons/ai";
import CreateTask from "./CreateTask";
import { BsFlower2, BsStar } from "solid-icons/bs";
import EditTask from "./EditTask";
import { title } from "process";
import { IoFlowerSharp, IoPaperPlaneSharp, IoReload, IoReloadCircleSharp } from "solid-icons/io";
import Header from "./Header";
import { getTasksFromDB } from "~/utils/database/databaseFunctions";
import Notification from "./Notification";
import { scheduleTasks, UnscheduledTask } from "~/utils/autoscheduling";
import { ScheduledTask } from "~/utils/taskStates";
import { newInfoPopup, newNotification } from "./App";
import ReflectionPopup from "./Reflection";

export default function PlanningView(props: {session: Session}) {
  onMount(() => setSession(props.session))
  onMount(refetchDB)
  const months = ["January ", "February ", "March ", "April ", "May ", "June ", "July ", "August ", "September ", "October ", "November ", "December"]

  // What is this for?
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

        <IoFlowerSharp
          size={30} 
          onclick={() => {
            ReflectionPopup(session())
          }} 

          class="fill-primary absolute right-16 top-12"
        />

        <FaSolidCircleInfo size={30} 
          onclick={() => 
            newInfoPopup([
              {title: "What is Eisenhower Matrix?", description: 
                <p>The Eisenhower Matrix organizes you tasks into four groups that show the order you should do them.<br /><br />

                  <strong>1.</strong> High Importance, High Urgency (red)<br />
                  <strong>2.</strong> High Importance, Low Urgency (orange)<br />
                  <strong>3.</strong> Low Importance, High Urgency (blue)<br />
                  <strong>4.</strong> Low Importance, Low Urgency (gray)<br /> <br />

                  When you complete your tasks in this order, you will be able to focus on the most important tasks, and not get distracted by the less important tasks!
                </p>
              },
              {title: "Using Eisenhower Matrix", description:
                <p>Omnis makes it very easy to use the Eisenhower Matrix to schedule your day!<br /><br />
                  As you add each of your tasks to your schedule, you will think about the importance of the task, and enter in task's due date to find the urgency. <strong>Always ask yourself, how important is this task to my goals, and how urgent is it?</strong> Then enter this information in. 

                  <br /><br />

                  Then, your tasks will show up on your schedule, and you can press the play button on whichever one you want to complete first. We suggest following the order given, but you can chose which ever order feels the most comfortable, the matrix is just a suggestion. 
                </p>
              }
            ])
          } 
          class="fill-primary absolute right-6 top-12" 
        />
      </Header>

      <div ref={setRef} class="grid grid-cols-2 gap-2 mt-5 px-3">
        <PlanningIndicators />

      </div>

      <div class="flex flex-row justify-start items-center gap-2 mt-5 px-8">
        <AddTaskButton onClick={() => setCreatingTask(true)}>Add Task</AddTaskButton>
      </div>

      <div class="rounded-tl-3xl rounded-tr-3xl bg-background-secondary mt-5 min-h-screen pb-[15vh]"> {/* TODO: Fix this height? */}
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

const [session, setSession] = createSignal<Session>()

// Get all tasks from the DB. This will then be used to schedule the tasks, then filtere for the day, then display
const getAllTasksFromDB = async (session: Session | undefined) => {
  if (!session) return

  const {data: databaseTasks, error} = await getTasksFromDB(session)
  if (error) {
    console.log(error)
    newNotification({ type: "error", text: "Error Getting tasks" }) // TODO: Add this functionality to the databasefuntions module
    return
  }

  return databaseTasks?.unscheduledTasks ?? []
}

const [getAllTasks, {mutate: mutateDB, refetch: refetchDB}] = createResource(session, getAllTasksFromDB)

const getCompletedTasksFromDB = async (session: Session | undefined) => {
  if (!session) return

  const {data: databaseTasks, error} = await getTasksFromDB(session)
  if (error) {
    console.log(error)
    newNotification({ type: "error", text: "Error Getting tasks" }) // TODO: Add this functionality to the databasefuntions module
    return
  }

  let date = new Date();
  return databaseTasks?.completedTasks?.filter(t => t.completed_time.getDate() == date.getDate()) ?? []
}

const [getCompletedTasks] = createResource(session, getCompletedTasksFromDB)


const getWorkingTaskFromDB = async (session: Session | undefined) => {
  if (!session) return

  const {data: databaseTasks, error} = await getTasksFromDB(session)
  if (error) {
    console.log(error)
    newNotification({ type: "error", text: "Error Getting tasks" }) // TODO: Add this functionality to the databasefuntions module
    return
  }

  return databaseTasks?.workingTask
}

const [getWorkingTask] = createResource(session, getWorkingTaskFromDB)

// Schedule the tasks
async function getScheduledTasks(tasks: UnscheduledTask[] | undefined) {
  if (!tasks || !session()) return

  const durationTasks = tasks.filter(task => task.duration !== null)
  const res = await scheduleTasks(session()!, durationTasks, []) // TODO: Why does this work
  if (res.error) {
    console.log(res.error)
    newNotification({ type: "error", text: res.error })
    return
  }

  return res.data ?? []
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
  const date = () => props.task.task.task.due_date.getDate() === new Date().getDate() ? "Today" : props.task.task.task.due_date.getMonth() + "/" + props.task.task.task.due_date.getDate()

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
      }}

      press={{
        scale: [.9]
      }}

      class="rounded-2xl shadow-lg bg-white min-h-36 min-w-44 max-w-[200px] py-2"
      onclick={() => setActiveTask(props.task.task.task)}
    >
      <div class="flex flex-row justify-start items-center gap-2 px-3 mt-2 mb-1">
        {props.task.task.task.importance == "High" ? 
          <FaRegularFlag size={18} class='fill-red-500' /> :
          null
        }
        <div class="flex flex-row items-center justify-center px-3 py-1 gap-2 bg-neutral-100 rounded-full text-secondary text-xs">
          <FaRegularCalendar size={18} class="fill-secondary" />
          {date()}
        </div>
      </div>

      <h1 class="mx-auto px-2 text-sm overflow-x-auto">{props.task.task.task.name}</h1>

      <p class="text-secondary px-2 text-xs overflow-x-clip">{props.task.task.task.description}</p>

      <div class="flex flex-row justify-start items-center gap-2 px-3 mt-2 mb-1">
        <div class="flex flex-row items-center justify-center px-3 py-1 gap-1 bg-neutral-100 rounded-full text-secondary text-xs">
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
          {color: (endPercentage: number) => endPercentage > 70 ? "lightgreen" : "lightgray", endPercentage: percentageSteps() ?? 0},
        ]}
      />

      <PlanningIndicator
        icon={<BsStar size={16} class="fill-primary" />} 
        description={<><strong class="text-primary font-extrabold">{percentageTasksWithMeaning() ?? 0}%</strong> of tasks have meaning</>} 
        indicatorsections={[
          {color: (endPercentage: number) => endPercentage > 70 ? "lightgreen" : "lightgray", endPercentage: percentageTasksWithMeaning() ?? 0},
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
