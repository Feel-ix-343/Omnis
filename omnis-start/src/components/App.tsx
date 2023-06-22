import { Show, type VoidComponent } from "solid-js";
import { A, createRouteData, useRouteData } from "solid-start";
import { trpc } from "~/utils/trpc";

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
