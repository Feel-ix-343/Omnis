import { Session } from "@supabase/supabase-js";
import { ChatCompletionRequestMessage } from "openai";
import { FaSolidBrain, FaSolidPaperPlane } from "solid-icons/fa";
import { IoFlowerSharp, IoReloadCircleSharp } from "solid-icons/io";
import { createEffect, createResource, createSignal, For } from "solid-js";
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

    return databaseTasks
  }

  async function getScheduledTasksForToday(tasks: UnscheduledTask[] | undefined) {
    if (!tasks || !session) return

    const durationTasks = tasks.filter(task => task.duration !== null)

    const res = await scheduleTasks(session, durationTasks, []) // TODO: Why does this work

    if (res.error) {
      console.log(res.error)
      newNotification(<Notification type="error" text={res.error} />)
      return
    }

    let today = new Date();
    let todaysTasks = res.data?.filter(s => s.scheduled_datetime.getDate() == today.getDate())

    return todaysTasks ?? []
  }

  const [getAllTasks, {mutate: mutateDB, refetch: refetchDB}] = createResource(session, getAllTasksFromDB)
  const [autoscheduledTasks] = createResource(getAllTasks()?.unscheduledTasks, getScheduledTasksForToday)


  let [message, setMessage] = createSignal<string>("");

  const startingMessages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: "You are a cognitive behavioral therapist. You first ask a question, then wait for the user to respond. You are guiding a client through a daily reflection"
    },
    {
      role: "user",
      content: `Here is what my day looks like. Scheduled: ${JSON.stringify(autoscheduledTasks())}; Completed Tasks: ${JSON.stringify(getAllTasks()?.completedTasks)}; Working Task (the one I am doing right now): ${JSON.stringify(getAllTasks()?.workingTask)} Use this for my reflection`
    }
  ]

  let [messages, setMessages] = createSignal<ChatCompletionRequestMessage[]>(startingMessages)


  const [getGPT, {refetch: newGPTMessage}] = createResource(messages, reflection)

  createEffect(() => console.log("Messages", getGPT()))

  newInfoPopup({pages: [{
    title: "Reflection",
    description: <div class="">

      <div class="overflow-y-scroll max-h-[500px]">
        <For each={getGPT()?.slice(2)}>
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

          <IoReloadCircleSharp size={30} onclick={() => {setMessages(startingMessages); newGPTMessage()}} />

          <FaSolidPaperPlane onclick={() => {
            let newMessage: ChatCompletionRequestMessage = {
              role: "user",
              content: message()
            }

            setMessages([...getGPT()!, newMessage])

            setMessage("")
          }} />
        </div>

      </div>


    </div>

  }]})
}

