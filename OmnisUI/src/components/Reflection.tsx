import { Session } from "@supabase/supabase-js";
import { ChatCompletionRequestMessage } from "openai";
import { FaSolidBrain, FaSolidPaperPlane } from "solid-icons/fa";
import { IoFlowerSharp, IoReloadCircleSharp } from "solid-icons/io";
import { createEffect, createMemo, createResource, createSignal, For, onMount } from "solid-js";
import { newInfoPopup, newNotification } from "../App";
import { scheduleTasks, UnscheduledTask } from "../utils/autoscheduling";
import { getTasksFromDB } from "../utils/database/databaseFunctions";
import { reflection } from "../utils/gpt";
import Notification from "./Notification";



export default async function ReflectionPopup(session: Session | undefined) {
  if (!session) return

  const getAllTasksFromDB = async (session: Session | undefined) => {
    if (!session) return

    const {data: databaseTasks, error} = await getTasksFromDB(session)

    if (error) {
      console.log(error)
      newNotification(<Notification type="error" text="Error Getting tasks" />) // TODO: Add this functionality to the databasefuntions module
      return
    }

    console.log("Database", databaseTasks)

    return databaseTasks
  }

  async function getScheduledTasksForToday(tasks: UnscheduledTask[] | undefined) {

    console.log("Tasks Hello", tasks)

    if (!tasks || !session) return

    const durationTasks = tasks.filter(task => task.duration !== null)

    const res = await scheduleTasks(session, durationTasks, []) // TODO: Why does this work

    if (res.error) {
      console.log(res.error)
      newNotification(<Notification type="error" text={res.error} />)
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

  const getMessages = async() => {
    let allTasks = await getAllTasksFromDB(session)
    let scheduled = allTasks ? await getScheduledTasksForToday(allTasks.unscheduledTasks ?? undefined) : null
    const startingMessages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: "You are a cognitive behavioral therapist. You first ask a question, then wait for the user to respond. You are guiding a client through a daily reflection"
      },
      {
        role: "user",
        content: `Here is what my day looks like. Scheduled: ${JSON.stringify(scheduled)}; Completed Tasks: ${JSON.stringify(allTasks?.completedTasks)}; Working Task (the one I am doing right now): ${JSON.stringify(allTasks?.workingTask)} Use this for my reflection`
      }
    ]
    let allmessages = [...startingMessages, ...messages() ?? []]
    let response = await reflection(allmessages)

    let newMessages = response.slice(startingMessages.length)
    setMessages(newMessages)

    return newMessages
  }

  let [messages, setMessages] = createSignal<ChatCompletionRequestMessage[]>()
  let [message, setMessage] = createSignal<string>("");


  const [getGPT, {refetch: newGPTMessage}] = createResource(getMessages)
  createEffect(() => console.log(getGPT()))

  newInfoPopup({pages: [{
    title: "Reflection",
    description: <div class="">

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
            let newMessage: ChatCompletionRequestMessage = {
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

  }]})
}

