import { Session } from "@supabase/supabase-js";
import { FaSolidBrain, FaSolidPaperPlane } from "solid-icons/fa";
import { IoFlowerSharp, IoReloadCircleSharp } from "solid-icons/io";
import { createEffect, createMemo, createResource, createSignal, For, onMount } from "solid-js";
import { ChatMessage } from "../../../OmnisGPT/omnis-gpt/bindings/ChatMessage";
import { scheduleTasks, UnscheduledTask } from "../utils/autoscheduling";
import { getGoalsFromDB, getTasksFromDB } from "../utils/database/databaseFunctions";
import { reflection } from "../utils/gpt";
import Notification from "./Notification";

import {ChatCompletionRequestMessage, Configuration} from "openai"
import { newInfoPopup, newNotification } from "./App";
import { createServerData$ } from "solid-start/server";
import { RouteDataArgs, useRouteData } from "solid-start";
import { client, queryClient, solidtRPC, trpc } from "~/utils/trpc";


export default async function ReflectionPopup(session: Session | undefined) {
  if (!session) return


  newInfoPopup([{
    title: "Reflection",
    description: () => <Content session={session} />
  }])
}



function Content(props: {session?: Session}) {

  const [messages, setMessages] = createSignal<ChatCompletionRequestMessage[]>([]) // All messages
  createEffect(() => console.log("Messages", messages()))
  const [message, setMessage] = createSignal<string>(""); // The message that the user is editing

  // TODO: Why isin't this refetching on change?
  const [completionRes, {refetch}] = createResource<ChatCompletionRequestMessage>(messages, async (messages: ChatCompletionRequestMessage[]) => {

    console.log("Call messages", messages)
    if (!props.session) return

    // Move these calls to a data fetcher
    const allTasks = await getAllTasksFromDB(props.session)
    if (!allTasks) { return }

    const scheduled = allTasks.unscheduledTasks ? await getScheduledTasksForToday(allTasks.unscheduledTasks, props.session) : null
    let today = new Date();
    let completed = allTasks.completedTasks ? allTasks.completedTasks.filter(t => t.completed_time.toDateString() === today.toDateString()) : null
    let goals = await getGoals(props.session)

    const r = await trpc.externalApis.reflection.query( {
      scheduledTasks: scheduled,
      workingTask: allTasks.workingTask,
      completedTasks: completed?.length === 0 ? null : completed,
      goals,
      messages: messages
    })

    return r

  } ) 
  // messages() !== undefined && scheduled() !== undefined && allTasks !== undefined && completed() !== undefined && goals() !== undefined


  const allMessages: () => ChatCompletionRequestMessage[] | null = () => {
    if (completionRes.loading) {
      return messages()
    } else if (completionRes()) {
      return messages().concat([completionRes()!])
    } else {
      return messages()
    }
  }

  return <div class="">

    <div class="overflow-y-scroll max-h-[500px]">
      <For each={allMessages()}>
        {(message) => <>
          <div class="flex flex-row gap-3 justify-start items-start my-2">

            {message.role == "assistant" ? <IoFlowerSharp size={20} class="mt-0.5" /> : message.role == "user" ? <FaSolidBrain class="mt-0.5" /> : null}
            <p>{message.content}</p>
          </div>
        </>}
      </For>
    </div>

    {completionRes.loading ? "loading..." : null}

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

        <IoReloadCircleSharp size={30} onclick={() => {setMessages([]); refetch()}} />

        <FaSolidPaperPlane onclick={() => {
          let newMessage: ChatCompletionRequestMessage = {
            role: "user",
            content: message()
          }

          setMessages([...allMessages() ?? [], newMessage])

          setMessage("")
        }} />
      </div>

    </div>


  </div>

}

const getAllTasksFromDB = async (session: Session) => {
  const {data: databaseTasks, error} = await getTasksFromDB(session)

  if (error) {
    console.log(error)
    newNotification({ type: "error", text: "Error Getting tasks" }) // TODO: Add this functionality to the databasefuntions module
    return null
  }

  console.log("Database", databaseTasks)

  return databaseTasks
}

async function getScheduledTasksForToday(tasks: UnscheduledTask[], session: Session) {

  const durationTasks = tasks.filter(task => task.duration !== null)

  const res = await scheduleTasks(session, durationTasks, []) // TODO: Why does this work

  if (res.error) {
    console.log(res.error)
    newNotification({type:"error", text:res.error })
    return null
  }

  let today = new Date();
  console.log(today.toDateString())
  let todaysTasks = res.data?.filter(s => {
    console.log(s.scheduled_datetime.toDateString())
    return s.scheduled_datetime.toDateString() === today.toDateString()
  }) ?? null
  console.log("Todays Tasks", todaysTasks)

  if (todaysTasks?.length === 0) return null


  return todaysTasks
}

const getGoals = async(session: Session) => {
  let {data, error} = await getGoalsFromDB(session)
  if (error) {
    newNotification({ text:"Error getting goals",  type:'error'})
    return null
  }
  return data
}
