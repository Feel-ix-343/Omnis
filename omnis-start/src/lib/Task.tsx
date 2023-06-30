import { JSXElement } from "solid-js"
import { supabase } from "./supabaseClient"


export class Task { // This gets passed to the basic list view at the start of planning
  constructor(
    public data: DBTask
  ) {}


  popupDisplay(): JSXElement {
    return <p>TEST TEST</p>
  } 
}

const tasksQuery = async (id: string) => {
  const {data, error} = await supabase.from("tasks").select("*").eq("user_id", id)
  return data
}

export type DBTask = NonNullable<Awaited<ReturnType<typeof tasksQuery>>>[0]
