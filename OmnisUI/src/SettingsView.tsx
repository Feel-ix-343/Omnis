import { Session } from "@supabase/supabase-js"
import { createEffect, createSignal, onMount } from "solid-js"
import { newNotification } from "./App"
import Notification from "./components/Notification"
import { supabase } from "./utils/database/supabaseClient"

export default function SettingsView(props: {session: Session}) {

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // TODO: Get name from database

  const [startHour, setStartHour] = createSignal<number>()
  const [endHour, setEndHour] = createSignal<number>()

  const loadStartEndHour = async () => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('start_time, end_time')
      .eq('user_id', props.session.user.id)
      .maybeSingle()

    if (error) {
      newNotification(<Notification type="error" text="Could not load settings" />)
    }

    setStartHour(data?.start_time ?? 9)
    setEndHour(data?.end_time ?? 17)
  }

  onMount(() => {
    loadStartEndHour()
  })


  createEffect(async () => {
    console.log("startHour", startHour())
    console.log("endHour", endHour())

    if (startHour() === undefined || endHour() === undefined) {
      return
    }

    const { data, error } = await supabase.from('user_settings').upsert({
      user_id: props.session.user.id,
      start_time: startHour()!,
      end_time: endHour()
    })

    if (error) {
      newNotification(<Notification type="error" text="Could not save settings" />)
    }
  })


  return (
    <div class="pt-40">

      <div class="fixed bg-background-secondary rounded-br-3xl rounded-bl-3xl shadow-lg p-10 max-h-40 top-0 right-0 left-0">
        <h1 class="text-xl">Hello {props.session.user.email}</h1>
        <h3>Here are your settings</h3>
      </div>

      <div>
      Start hour (military): <input type="number" value={startHour()} onInput={e => setStartHour(parseInt(e.currentTarget.value))} />
      </div>
      <div>
      End hour (military): <input type="number" value={endHour()} onInput={e => setEndHour(parseInt(e.currentTarget.value))} />
      </div>

      <button 
        class="px-3 py-1 bg-highlight border-2 border-green-400 shadow-sm rounded-full mx-2 active:scale-90 transition-all"
        onclick={logout}
      >
        Log out
      </button>
    </div>
  )
}
