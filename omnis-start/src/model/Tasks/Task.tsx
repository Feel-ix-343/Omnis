import { JSXElement } from "solid-js"
import { supabase } from "~/lib/supabaseClient"


export class Task { // This gets passed to the basic list view at the start of planning
  constructor( public data: DBTask) {}

  popupDisplay(): JSXElement {
    return <p>TEST TEST</p>
  } 

  getDueDate() {
    if (this.data.due_date) return new Date(this.data.due_date)
    else return null
  }

  getUrgency() {
    if (this.data.user_urgency) return this.data.user_urgency
    //else if (this.data.urgen)i TODO handle algo urgency
    else return null
  }
}

const tasksQuery = async (id: string) => {
  const {data, error} = await supabase.from("tasks").select("*").eq("user_id", id)
  return data
}

export type DBTask = NonNullable<Awaited<ReturnType<typeof tasksQuery>>>[0]
