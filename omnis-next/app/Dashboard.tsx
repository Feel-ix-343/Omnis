'use client'

import Todos from "@/components/todos";
import { User } from "@supabase/supabase-js";
import Tool from "./tool";
import { DragDropContext, OnDragEndResponder, resetServerContext } from "react-beautiful-dnd";
import { useCallback } from "react";
import useTodos, { Todo } from "@/hooks/useTodos";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { toast } from "@/components/ui/use-toast";
import dayjs from "dayjs";

export default function (props: {user: User}) {

  resetServerContext()
  const supabase = createClientComponentClient<Database>()
  const {data, mutate} = useTodos()
  const onDragEnd = useCallback((r => {

    if (!r.destination?.index && r.destination?.index !== 0) {
      toast({
        title: "Drop into a list"
      })
      return
    }

    let importance : number | null = null
    let urgency : number | null = null
    if (r.destination?.droppableId === "doNow") {} // good

    if (r.destination?.droppableId === "schedule") {
      importance = 0
      urgency = 1
    }

    if (r.destination?.droppableId === "avoid") {
      importance = 1
      urgency = 0
    }

    if (r.destination?.droppableId === "doLater") {
      importance = 1
      urgency = 1
    }

    if (r.destination?.droppableId === "allTodos") {
      importance = null
      urgency = null
    }

    const taskId = dayjs(r.source.droppableId).isValid() ? JSON.parse(r.draggableId).id : r.draggableId

    console.log(r)
    console.log(taskId)

    mutate(
      async () => {

        if (r.destination!.droppableId !== r.source.droppableId) {
          await supabase.rpc('decrement_below', {starting: r.source.index, list_date: r.source!.droppableId, inclusive: false})
          await supabase.rpc('increment_below', {starting: r.destination!.index, list_date: r.destination!.droppableId, inclusive: true})
        } else if (r.destination!.index < r.source.index) {
          await supabase.rpc('increment', {starting_index: r.destination!.index, move_index: r.source.index, list_date: r.destination!.droppableId})
        } else {
          await supabase.rpc('decrement', {starting_index: r.destination!.index, move_index: r.source.index, list_date: r.destination!.droppableId})
        }
        await supabase.from('todos').update({index: r.destination!.index, scheduled_date: r.destination!.droppableId}).eq('id', taskId)
      }, 
      {
        optimisticData: c => {
          if (!c) return []
          return c.map(t => {
            if (r.destination!.droppableId !== r.source.droppableId) {
              if (t.index > r.source.index && t.scheduled_date === r.source.droppableId) return {...t, index: t.index - 1} // decrement todo: make this better
              else if (t.index >= r.destination!.index && t.scheduled_date === r.destination!.droppableId) return {...t, index: t.index + 1} // increment
            } else if (t.scheduled_date !== r.destination!.droppableId) return t
            else if (r.destination!.index < r.source.index && t.index >= r.destination!.index && t.index < r.source.index) {
              return {...t, index: t.index + 1}
            } else if (t.index <= r.destination!.index && t.index > r.source.index) {
              return {...t, index: t.index - 1}
            } 

            if (t.id === taskId) {
              return {...t, index: r.destination!.index, scheduled_date: r.destination!.droppableId}
            } else return t
          })
        }, 
        populateCache: false
      }
    )

  }) satisfies OnDragEndResponder, [])

  return <div className="w-full flex flex-row px-12 gap-8 mt-10 h-[85vh]">

    <DragDropContext onDragEnd={onDragEnd}>
      <Todos user={props.user!} />
      <Tool uid={props.user.id} />
    </DragDropContext>


  </div>
}
