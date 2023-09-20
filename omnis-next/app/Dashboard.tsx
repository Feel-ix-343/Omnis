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

export default function (props: {user: User}) {

  resetServerContext()
  const supabase = createClientComponentClient<Database>()
  const {data, mutate} = useTodos()
  const onDragEnd = useCallback((r => {
    let importance : number | null = 0
    let urgency : number | null = 0
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

    const taskId = r.source.droppableId ===  "allTodos" ? JSON.parse(r.draggableId).id : r.draggableId

    console.log(r)

    mutate(
      async () => {
        if (r.destination!.index < r.source.index) {
          await supabase.rpc('increment', {starting_index: r.destination!.index, move_index: r.source.index})
        } else {
          await supabase.rpc('decrement', {starting_index: r.destination!.index, move_index: r.source.index})
        }
        await supabase.from('todos').update({index: r.destination!.index}).eq('id', taskId)
      }, 
      {
        optimisticData: c => c?.map(to => to.id === taskId ? {...to, importance, urgency} satisfies Todo : to) ?? [], 
        populateCache: false
      }
    )

  }) satisfies OnDragEndResponder, [])

  return <div className="w-full flex flex-row px-12 gap-8 mt-10 h-[85vh]">

    <DragDropContext onDragEnd={onDragEnd}>
      <Todos user={props.user!} />
      <Tool />
    </DragDropContext>


  </div>
}
