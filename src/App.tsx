import { Session } from '@supabase/supabase-js';
import { Component, createEffect, createSignal, onMount } from 'solid-js';

import CalendarView from './CalendarView';
import Nav from './components/Nav';
import { supabase } from './database/supabaseClient';
import LoginScreen from './LoginScreen';
import SettingsView from './SettingsView';
import PlanningView from './PlanningView';

const App: Component = () => {
  const [getIndex, setIndex] = createSignal(1); // Initialize on the calendar screen

  const [getSession, setSession] = createSignal<Session | null>(null)

  onMount(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  })

  createEffect(() => {
    console.log("Session", getSession())
  })

  return (
    <>
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
