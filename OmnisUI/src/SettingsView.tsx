import { Session } from "@supabase/supabase-js"
import { supabase } from "./utils/database/supabaseClient"

export default function SettingsView(props: {session: Session}) {

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // TODO: Get name from database

  return (
    <div class="pt-40">

      <div class="fixed bg-background-secondary rounded-br-3xl rounded-bl-3xl shadow-lg p-10 max-h-40 top-0 right-0 left-0">
        <h1 class="text-4xl">Felix Zeller</h1>
        <h3>Here are your settings</h3>
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
