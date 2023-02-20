import { Motion, Presence, PresenceContext } from "@motionone/solid";
import { Session } from "@supabase/supabase-js";
import { spring } from "motion";
import { AiOutlineCalendar, AiOutlineCloseCircle } from "solid-icons/ai";
import { IoDocumentTextOutline } from 'solid-icons/io'
import { BsFlag, BsHourglass } from "solid-icons/bs";
import { createEffect, JSXElement, Show } from "solid-js";
import Header from "./components/Header";

export default function(props: {session: Session, show: boolean, close: () => void}) {
  const createTask = () => {
    // TODO: IMPLIMPLIMPL
  }
  return (
    <>
      <Presence>
        <Show when={props.show}>
          <Motion.div
            animate={{
              opacity: [0, .2],
            }}

            transition={{
              duration: .6,
            }}

            class="w-full h-screen bg-black absolute top-0 z-40"
          />
        </Show>
      </Presence>
      <Presence>
        <Show when={props.show}>
          <Motion.div
            animate={{
              opacity: [0, 1],
              height: ["0%", "89%"]
            }}

            transition={{
              duration: .6,
            }}

            exit={{
              opacity: [1, 0],
              height: ["90%", "0%"]
            }}

            class="w-full overflow-y-hidden z-50 bg-white absolute bottom-0 rounded-tr-3xl rounded-tl-3xl"
          >
            <div class="bg-background-secondary pt-8 pb-4 px-4">
              <div class="flex flex-row items-center mb-2 gap-2">
                <AiOutlineCloseCircle onclick={props.close} size={50} class="fill-secondary left-6 top-12" />
                <button onclick={() => {props.close(); createTask()}} class="ml-auto bg-white rounded-lg px-3 py-1 font-bold text-xl shadow-md">Create</button>
              </div>

              <input type="text" class="w-full px-4 h-7 py-2 font-bold text-center bg-background-secondary text-3xl placeholder-primary" placeholder="Add Task Name" />
            </div>

            <div class="flex flex-row flex-wrap justify-start items-center text-secondary gap-2 mt-5 px-4">
              <AiOutlineCalendar size={35} class="fill-secondary" />

              <h3 class="text-secondary whitespace-nowrap">This task is due</h3>

              <Button>Add Due Date</Button>

            </div>

            <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
              <BsFlag size={35} class="fill-secondary" />

              <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3">
                This task has <Button>Select</Button> importance in <div class="flex flex-row bg-background-secondary p-1 rounded-full font-bold text-primary text-sm">Being more active in school</div>
              </div>

            </div>

            <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
              <BsHourglass size={35} class="fill-secondary" />

              <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3">
                It should take
                <Button>Select Duration</Button>
              </div>

            </div>

            <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
              <IoDocumentTextOutline size={35} class="fill-secondary" />

              <textarea

                style={{
                  "box-shadow": "inset 0px 3px 4px 1px rgba(0, 0, 0, 0.15)",
                }}

                class="bg-background-secondary p-2 rounded-lg w-full"
                placeholder="Why is this important?" 
              />

            </div>
          </Motion.div>

        </Show>
      </Presence>
    </>
  )
}

function Button(props: {children: JSXElement, onClick?: () => void}) {
  return (
    <button 
      class="bg-background-secondary text-primary font-bold px-3 py-1 rounded-xl shadow-md flex items-center border-2 border-neutral-200" 
    >{props.children}</button>
  )
}
