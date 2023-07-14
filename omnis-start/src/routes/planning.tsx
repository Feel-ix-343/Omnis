import {A, Navigate, Outlet, useParams, useRouteData} from "@solidjs/router";
import { redirect } from "solid-start/server";

import useSession from "~/lib/session";

const [notifications, setNotifications] = createSignal<NotificationProps[]>([])
/** creates notifications of type `Notification` JSX element`
@param notif Notification
*/
export const newNotification = (notif: NotificationProps) => setNotifications(notifications().concat(notif))
// TODO: Make the notification timing better

// export const

export const  [infoPopupPages, newInfoPopup] = createSignal<InfoPopupProps["pages"] | null>(null)


export function routeData() {

  const session = createRouteData(async() => {
    return await useSession()
  })

  const allTasks = createRouteData(async () => {

    //const user_id = (await useSession()).user.id
    const user_id = "8122fefc-8817-4db7-bb91-5bc7f2116f7d"

    const {data: tasks, error} = await getAllTasks(user_id)
    if (error) {
      newNotification({text: "Error Getting Tasks", type: "error"})
      return
    }

    return tasks
  })

  // const userSettings = createRouteData(async () => {
  //   const session = await session()
  // })


  return {
    session,
    allTasks
  }
}

export default function App() {


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

  return (
    <div>

      {notifications().map(Notification)}
      <InfoPopup pages={infoPopupPages()} close={() => newInfoPopup(null)} />

      <Outlet />

      <Nav />

    </div>
  )

};


import { Motion, Presence } from "@motionone/solid";
import { AiOutlineCheckCircle, AiOutlineClose, AiOutlineCloseCircle, AiOutlineInfoCircle } from "solid-icons/ai";
import {createEffect, createResource, JSXElement, onMount, Resource, Show } from "solid-js";
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
import { createRouteData, useLocation } from "solid-start";
import { getAllTasks } from "~/model/getState";
function Nav (){

  const classes = (path: string) => { return `mx-auto ${location.pathname === path || location.pathname === path + "/" ? "fill-primary" : "fill-white"}` }

  const location = useLocation()
  console.log(location.pathname)

  return(
    <div
      style={{"box-shadow": "inset 0px -8px 4px 7px rgba(0, 0, 0, 0.2), 0px 2px 9px 2px rgba(0, 0, 0, 0.4)"}}
      class="fixed left-0 right-0 bg-primary inset-x-2 h-16 bottom-7 rounded-full mx-20 px-2 grid grid-cols-3 items-center"
    >
      <A href="/planning" class="z-50"><FaRegularSquareCheck class={classes("/planning")} size={40} /></A>
      <A href="/planning/calendar" class="z-50"><FaRegularClock class={classes("/planning/calendar")} size={40} /></A>
      <A href="/planning/settings" class="z-50 text-white"><BsGear class={classes("/planning/settings")} size={40} /></A>
    </div>
  )
}
