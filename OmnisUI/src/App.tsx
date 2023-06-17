import { Session } from '@supabase/supabase-js';
import { Component, createEffect, createSignal, JSXElement, onMount } from 'solid-js';

import CalendarView from './CalendarView';
import Nav from './components/Nav';
import { supabase } from './utils/database/supabaseClient';
import LoginScreen from './LoginScreen';
import SettingsView from './SettingsView';
import PlanningView from './PlanningView';
import InfoPopup, { InfoPopupProps } from './components/InfoPopup';

const [notifications, setNotifications] = createSignal<JSXElement[]>([])
/** creates notifications of type `Notification` JSX element`
@param notif Notification
*/
export const newNotification = (notif: JSXElement) => setNotifications(notifications().concat(notif))
// TODO: Make the notification timing better

// export const

const  [infoPopup, setInfoPopup] = createSignal<JSXElement | null>(null)
export const newInfoPopup = (props: InfoPopupProps) => setInfoPopup(<InfoPopup pages={props.pages} />)


const App: Component = () => {

  console.log("Vite url", import.meta.env.VITE_SUPABASE_URL)
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

  return (
    <>

      {notifications()}
      {infoPopup()}


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
    </>
  )

};

export default App;
