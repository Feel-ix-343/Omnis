import { Database } from "@/lib/database.types"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import DragDropHandler from "../DragDropHandler"
import Todos from "@/components/todos"
import Tool from "../tool"
import { redirect } from "next/navigation"
import ClientStore from "./ClientStore"
import { revalidatePath } from "next/cache"
import { cache } from "react"

export interface Data {
  tasks: Awaited<ReturnType<typeof getTodos>>
}

const getTodos = cache(async (uid: string) => {
  const supabase = createServerComponentClient<Database>({cookies})
  const {data: tasks, error} = await supabase.from('todos').select("*").eq('user_id', uid)
  // handle error
  return tasks
})

async function mutateIt() {
  'use server'
  //wait 3 seconds
  await new Promise((r) => setTimeout(r, 3000))
  revalidatePath('/planning')
}

export default async function() {

  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser() // figure out to use a better api for this. There should always be a user when this page loads. 
  if (!user) return redirect('/')

  const tasks = await getTodos(user.id)


  return (<div className="w-full flex flex-row px-12 gap-8 mt-10 h-[85vh]">
    <ClientStore data={{tasks: tasks}} />
    <DragDropHandler>
      <Todos mutateIt={mutateIt} />
    </DragDropHandler>
    {/* <DragDropHandler> */}
    {/*   <p className="mt-96">Hello</p> */}
    {/*   <Todos /> */}
    {/*   <Tool uid={user.id} /> */}
    {/* </DragDropHandler> */}
  </div>
  )
}
