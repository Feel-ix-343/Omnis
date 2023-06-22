import { Session } from "@supabase/supabase-js";
import { FaSolidBrain, FaSolidPaperPlane } from "solid-icons/fa";
import { IoFlowerSharp, IoReloadCircleSharp } from "solid-icons/io";
import { createEffect, createMemo, createResource, createSignal, For, onMount } from "solid-js";
import { ChatMessage } from "../../../OmnisGPT/omnis-gpt/bindings/ChatMessage";
import { scheduleTasks, UnscheduledTask } from "../utils/autoscheduling";
import { getGoalsFromDB, getTasksFromDB } from "../utils/database/databaseFunctions";
import { reflection } from "../utils/gpt";
import Notification from "./Notification";

import {Configuration} from "openai"
import { newInfoPopup, newNotification } from "./App";

const getAllTasksFromDB = async (session: Session | undefined) => {
  if (!session) return

  const {data: databaseTasks, error} = await getTasksFromDB(session)

  if (error) {
    console.log(error)
    newNotification({ type: "error", text: "Error Getting tasks" }) // TODO: Add this functionality to the databasefuntions module
    return
  }

  console.log("Database", databaseTasks)

  return databaseTasks
}

async function getScheduledTasksForToday(tasks: UnscheduledTask[] | undefined, session: Session | undefined) {

  console.log("Tasks Hello", tasks)

  if (!tasks || !session) return

  const durationTasks = tasks.filter(task => task.duration !== null)

  const res = await scheduleTasks(session, durationTasks, []) // TODO: Why does this work

  if (res.error) {
    console.log(res.error)
    newNotification({type:"error", text:res.error })
    return
  }

  let today = new Date();
  console.log(today.toDateString())
  let todaysTasks = res.data?.filter(s => {
    console.log(s.scheduled_datetime.toDateString())
    return s.scheduled_datetime.toDateString() === today.toDateString()
  })
  console.log("Todays Tasks", todaysTasks)


  return todaysTasks
}

const getGoals = async(session?: Session) => {
  if (!session) return
  let {data, error} = await getGoalsFromDB(session)
  if (error) {
    newNotification({ text:"Error getting goals",  type:'error'})
    return
  }
  return data
}

const getMessages = async(session: Session | undefined) => {
  let allTasks = await getAllTasksFromDB(session)
  let scheduled = allTasks ? await getScheduledTasksForToday(allTasks.unscheduledTasks ?? undefined, session) : null

  let today = new Date();
  let completed = allTasks?.completedTasks?.filter(t => t.completed_time.toDateString() === today.toDateString())

  let goals = await getGoals(session)

  const startingMessages: ChatMessage[] = [
    {
      role: "system",
      content: `You are a cognitive behavioral therapist. You first ask a question, then wait for the user to respond. You are guiding a client through a daily reflection. The user will give tasks and goals by id. Refer to the tasks and goals by their names. Here is what the user's day looks like. Scheduled: ${JSON.stringify(scheduled)}; Completed Tasks: ${JSON.stringify(completed)}; Working Task (the one I am doing right now): ${JSON.stringify(allTasks?.workingTask)}. Here are the user's goals, each goal is linked to a task by its id: ${JSON.stringify(goals)}. Use the scheduled, completed, working tasks and goals to guide the user through a daily reflection`
    },
    // {
    //   role: "user",
    //   content: `Here is what my day looks like. Scheduled: ${JSON.stringify(scheduled)}; Completed Tasks: ${JSON.stringify(completed)}; Working Task (the one I am doing right now): ${JSON.stringify(allTasks?.workingTask)} Use this for my reflection`
    // },
    // {
    //   role: "user",
    //   content: `Here are my long-term goals. Each goal has an id that is linked to a task by the id. ${JSON.stringify(goals)}`
    // }
  ]
  console.log("Starting Message", startingMessages)
  let allmessages = [...startingMessages, ...messages() ?? []]

  let {data, error} = await reflection(allmessages)

  if (error) {
    newNotification({ text: "Error getting messages",  type: "error" })
    return
  } else if (!data) {
    newNotification({ text: "No Response from Chat",  type: "error" })
    return
  }

  let newMessages = data.slice(startingMessages.length)
  setMessages(newMessages)

  return newMessages
}

let [messages, setMessages] = createSignal<ChatMessage[]>()
let [message, setMessage] = createSignal<string>("");



export default async function ReflectionPopup(session: Session | undefined) {
  if (!session) return


  newInfoPopup({pages: [{
    title: "Reflection",
    description: <Content session={session} />
  }]})
}


function Content(props: {session?: Session}) {

  const [getGPT, {refetch: newGPTMessage}] = createResource(async () => await getMessages(props.session))

  return <div class="">

    <div class="overflow-y-scroll max-h-[500px]">
      <For each={getGPT()}>
        {(message) => <>
          <div class="flex flex-row gap-3 justify-start items-start my-2">

            {message.role == "assistant" ? <IoFlowerSharp size={20} class="mt-0.5" /> : message.role == "user" ? <FaSolidBrain class="mt-0.5" /> : null}
            <p>{message.content}</p>
          </div>
        </>}
      </For>
    </div>

    {getGPT.loading ? "loading..." : null}

    <div class="mt-4 flex flex-row justify-center items-center gap-5">
      <textarea

        style={{
          "box-shadow": "inset 0px 3px 4px 1px rgba(0, 0, 0, 0.15)",
        }}

        class="bg-background-secondary p-2 rounded-lg w-full"
        placeholder="Respond" 

        value={message()} 

        onChange={(e) => setMessage(e.currentTarget.value ?? "")}
      />

      <div class="flex flex-col justify-center items-center gap-4">

        <IoReloadCircleSharp size={30} onclick={() => {setMessages(); newGPTMessage()}} />

        <FaSolidPaperPlane onclick={() => {
          let newMessage: ChatMessage = {
            role: "user",
            content: message()
          }

          setMessages([...getGPT()!, newMessage])
          newGPTMessage()

          setMessage("")
        }} />
      </div>

    </div>


  </div>

}
