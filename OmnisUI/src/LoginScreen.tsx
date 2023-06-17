import { supabase } from "./utils/database/supabaseClient"


export default function LoginScreen() {
  const logInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: import.meta.env.VITE_URL
      } // TODO: handle redirect for prod and dev
    })
  }

  // Add names

  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <h1 class="text-7xl">Omnis</h1>
      <h3 class="text-2xl">Guided Daily Planning</h3>

      <button 
        class="bg-background-secondary mt-10 text-xl border-2 border-neutral-200 rounded-full px-6 py-2" 
        onclick={logInWithGoogle}>Continue with Google</button>
    </div>
  )
}
