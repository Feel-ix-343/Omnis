import { Motion, Presence } from "@motionone/solid"
import { spring } from "motion"
import { createEffect, createSignal, For, JSXElement, Show } from "solid-js"
import Button from "./Button"

interface DropDownChoice<T> {
  display: string,
  value: T
}

export function DropDown<T>(props: {children: JSXElement, choices: DropDownChoice<T>[], choiceOutput?: string | null, setChoice: (choiceValue: T) => void, class?: string}) {
  const [show, setShow] = createSignal(false)

  const [ref, setRef] = createSignal<HTMLButtonElement>()

  createEffect(() => {
    document.addEventListener("touchstart", (e) => {
      if (ref()?.contains(e.target)) return // TODO: FIx
      else setShow(false)
    })
  })

  return (
    <div ref={setRef} class={ "flex flex-col justify-center items-center " + props.class}>

      <Button class={(show() ? "opacity-0" : "") + " min-w-[50px] flex items-center justify-center"} focus={{focuson: () => setShow(true), focusoff: () => setShow(false)}}>
        {props.choiceOutput ?? props.children}
      </Button>

      <Presence>
        <Show when={show()}>
          <Motion.div

            transition={{duration: .3, easing: spring()}}

            animate={{
              scale: [.7, 1],
              scaleY: [0, 1],
            }}

            exit={{
              opacity: [1, 0]
            }}

            class="min-w-[50px] absolute bg-background-secondary rounded-xl shadow-xl border-2 border-neutral-200 p-2 overflow-hidden flex flex-col justify-center items-center"
          >
            <For each={props.choices}>
              {(choice, index) => <button onClick={() => {props.setChoice(props.choices[index()].value); setShow(false)}} class="font-bold text-primary">{choice.display}</button>}
            </For>
          </Motion.div>
        </Show>
      </Presence>
    </div>
  )
}
