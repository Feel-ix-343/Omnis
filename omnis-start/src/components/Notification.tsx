import { Motion, Presence } from "@motionone/solid";
import { AiOutlineCheckCircle, AiOutlineClose, AiOutlineCloseCircle, AiOutlineInfoCircle } from "solid-icons/ai";
import { createSignal, JSXElement, Show } from "solid-js";

export type NotificationProps = {
  text: string,
  type: "info" | "error" | "success"
}
export default function Notification(props: NotificationProps) {
  const [show, setShow] = createSignal(true)

  setTimeout(() => {
    setShow(false)
  }, 2000)


  return (
    <Presence>
      <Show when={show()}>
        <Motion.div
          animate={{
            y: [-100, 0],
          }}

          exit={{
            y: -100
          }}

          class="left-[2%] right-[2%] fixed top-5 h-16 z-50 rounded-xl flex flex-row justify-start items-center gap-2 border-2 shadow-xl px-2 text-xl font-semibold"
          classList={{
            "bg-sky-100 border-sky-200": props.type === "info",
            "bg-green-100 border-green-200": props.type === "success",
            "bg-red-100 border-red-200": props.type === "error",
          }}
        >
          {props.type === "info" ? 
            <AiOutlineInfoCircle size={35} class="fill-primary" /> 
            : props.type === "error" ? <AiOutlineCloseCircle size={35} class="fill-primary" /> 
              : <AiOutlineCheckCircle size={35} class="fill-primary" />}
          {props.text}
        </Motion.div>
      </Show>
    </Presence>
  )
}
