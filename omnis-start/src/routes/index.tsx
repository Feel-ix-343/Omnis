import {Outlet} from "@solidjs/router";

const [notifications, setNotifications] = createSignal<NotificationProps[]>([])
/** creates notifications of type `Notification` JSX element`
@param notif Notification
*/
export const newNotification = (notif: NotificationProps) => setNotifications(notifications().concat(notif))
// TODO: Make the notification timing better

// export const

export const  [infoPopupPages, newInfoPopup] = createSignal<InfoPopupProps["pages"] | null>(null)

//export const routeData = () => {
//  return createServerData$(() => {
//    const t = process.env.SERVER_OPENAI_API_KEY
//    console.log(t)
//    return t
//  })
//}


export default function App() {

  console.log("Supabase URL url", import.meta.env.VITE_SUPABASE_URL)

  //const apikey = useRouteData<typeof routeData>();
  //createEffect(() => console.log("Key", apikey()))

  const [getIndex, setIndex] = createSignal(parseInt(localStorage.getItem("index") ?? "1")); // Initialize on the calendar screen

  createEffect(() => localStorage.setItem("index", getIndex().toString()))

  const [getSession, setSession] = createSignal<Session | null>(null)

  onMount(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {

      setSession(session)
    })


    supabase.auth.onAuthStateChange((event, session) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        // delete cookies on sign out
        const expires = new Date(0).toUTCString()
        document.cookie = `my-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`
        document.cookie = `my-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const maxAge = 100 * 365 * 24 * 60 * 60 // 100 years, never expires
        document.cookie = `my-access-token=${session!.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`
        document.cookie = `my-refresh-token=${session!.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`
      }
    })
  })


  createEffect(() => console.log("InfoChanged", infoPopupPages()))


  return (
    <div>

      {notifications().map(Notification)}
      <InfoPopup pages={infoPopupPages()} close={() => newInfoPopup(null)} />

      <Outlet />

      <Nav activeScreenIndex={getIndex()} setIndex={setIndex} />

    </div>
  )

};


import { Motion, Presence } from "@motionone/solid";
import { Session } from "@supabase/supabase-js";
import { AiOutlineCheckCircle, AiOutlineClose, AiOutlineCloseCircle, AiOutlineInfoCircle } from "solid-icons/ai";
import {createEffect, JSXElement, onMount, Show } from "solid-js";
import InfoPopup, { InfoPopupProps } from "~/components/InfoPopup";
import { supabase } from "~/lib/supabaseClient";

export type NotificationProps = {
  text: string,
  type: "info" | "error" | "success"
}
export function Notification(props: NotificationProps) {
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
                <AiOutlineInfoCircle size={35} class="fill-primary"/>
                : props.type === "error" ? <AiOutlineCloseCircle size={35} class="fill-primary"/>
                    : <AiOutlineCheckCircle size={35} class="fill-primary"/>}
            {props.text}
          </Motion.div>
        </Show>
      </Presence>
  )
}



  import { FaRegularClock, FaRegularSquareCheck } from 'solid-icons/fa'
  import { BsGear, BsGearWide } from 'solid-icons/bs'
  import { createSignal } from "solid-js"

function Nav (props: {activeScreenIndex: number, setIndex: (index: number) => void}){

  const switchScreen = (index: number) => {
    props.setIndex(index)
    console.log(props.activeScreenIndex)
  }

  const classes = (index: number) => { return `mx-auto ${props.activeScreenIndex === index ? "fill-primary" : "fill-white"}` }

  return(
      <div
          style={{"box-shadow": "inset 0px -8px 4px 7px rgba(0, 0, 0, 0.2), 0px 2px 9px 2px rgba(0, 0, 0, 0.4)"}}
          class="fixed left-0 right-0 bg-primary inset-x-2 h-16 bottom-7 rounded-full mx-20 px-2 grid grid-cols-3 items-center"
      >
        <div class="z-50 text-white"><FaRegularSquareCheck onclick={() => switchScreen(0)} class={classes(0)} size={40} /></div>
        <div class="z-50"><FaRegularClock onclick={() => switchScreen(1)} class={classes(1)} size={40} /></div>
        <div class="z-50 text-white"><BsGear onclick={() => switchScreen(2)} class={classes(2)} size={40} /></div>
        <div
            class={ `rounded-full bg-highlight border-green-400 transition-all border-2 w-[80px] h-[80px] shadow-highlight shadow-md absolute left-0 right-0 ${
                props.activeScreenIndex === 0 ? "left-[2%]" : props.activeScreenIndex === 1 ? "left-[32%]" : "left-[63%]"
            }` } />
      </div>
  )
}
