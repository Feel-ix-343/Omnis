'use client'
import { toast } from "@/components/ui/use-toast"
import { useCallback } from "react"
import { DragDropContext, OnDragEndResponder } from "react-beautiful-dnd"
import { useStore } from "./planning/ClientStore"

export default function(props: {children: any}) {
  const onDragEnd = useCallback((r => {
    if (r.source.droppableId === r.destination?.droppableId) {
      useStore.setState(set => {
        const tasks = set.data?.tasks

      } )
    }
  }) satisfies OnDragEndResponder, [])

  return <DragDropContext onDragEnd={onDragEnd}>
    {props.children}
  </DragDropContext>
}
