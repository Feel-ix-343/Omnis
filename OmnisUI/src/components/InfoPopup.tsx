import { Motion, Presence } from "@motionone/solid";
import { AiOutlineClose, AiOutlineCloseCircle } from "solid-icons/ai";
import { createSignal, JSXElement, onMount, Show } from "solid-js";
import { CgChevronLeftO, CgChevronRightO, CgChevronUpO } from 'solid-icons/cg'

export interface InfoPopupProps {
  pages: {
    title: string,
    description: JSXElement
  }[]
}

export default function(props: {pages: {title: string, description: JSXElement}[]}) {
  const [show, setShow] = createSignal(false)
  onMount(() => setShow(true))
  const [index, setIndex] = createSignal(0)
  const currentPage = () => props.pages[index()]
  return (
    <>
      <Presence>
        <Show when={show()}>
          <Motion.div
            transition={{
              duration: 0.3,
            }}
            animate={{
              opacity: [0, 1],
            }}
            exit={{
              opacity: 0,
            }}
            class="fixed h-full w-full bg-black bg-opacity-50 z-40" />
        </Show>
      </Presence>

      <Presence>
        <Show when={show()}>
          <Motion.div 
            transition={{
              duration: 0.3,
            }}
            animate={{ 
              opacity: [0, 1],
              scale: [0.5, 1]
            }}
            exit={{
              opacity: 0,
              scale: 0.5
            }}

            class="fixed rounded-3xl bottom-2 shadow-2xl p-10 bg-white z-50 left-2 right-2"
          >
            <AiOutlineCloseCircle class="absolute top-10 right-10 fill-primary" size={30} onClick={() => setShow(false)} />
            {index() > 0 && <CgChevronLeftO class="absolute bottom-3 left-3 fill-primary" size={30} onClick={() => setIndex(index() - 1)} />}
            {index() < props.pages.length - 1 && <CgChevronRightO class="absolute bottom-3 right-3 fill-primary" size={30} onClick={() => setIndex(index() + 1)} />}
            <h1>{currentPage().title}</h1>
            {currentPage().description}
          </Motion.div>
        </Show>
      </Presence>
    </>
  );
}
