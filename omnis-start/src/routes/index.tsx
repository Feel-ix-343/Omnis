import { Show, type VoidComponent } from "solid-js";
import { A, createRouteData, useRouteData } from "solid-start";
import { solidtRPC } from "~/utils/trpc";

import { Session } from '@supabase/supabase-js';
import { Component, createEffect, createSignal, JSXElement, onMount } from 'solid-js';
import InfoPopup, { InfoPopupProps } from "~/components/InfoPopup";
import Nav from "~/components/Nav";
import { supabase } from "~/utils/database/supabaseClient";
import LoginScreen from "~/components/LoginScreen";
import SettingsView from "~/components/SettingsView";
import CalendarView from "~/components/CalendarView";
import PlanningView from "~/components/PlanningView";
import server$, { createServerData$ } from "solid-start/server";
import { createStore } from "solid-js/store";
import Notification, { NotificationProps } from "./Notification";

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


      {getSession() === null ?
        <LoginScreen /> :
        <div>
          {
            getIndex() === 2?
              <SettingsView session={getSession()!} />
              : getIndex() === 1 ?
                <CalendarView session={getSession()!} />
                : getIndex() === 0 ?
                  <PlanningView session={getSession()!} /> 
                  : null
          }

          <Nav activeScreenIndex={getIndex()} setIndex={setIndex} />
        </div>
      }
    </div>
  )

};


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
