'use client'

import { Card } from "@/components/ui/card"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useTodos, { Todo } from "@/hooks/useTodos"
import { PlusCircle } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "react-beautiful-dnd"

export default function Tool() {
  const [executing, setExecuting] = useState(false)

  const {data: todos} = useTodos()

  console.log("tool", todos)

  const doNow = useMemo(() => todos?.filter(t => t.importance == 0 && t.urgency == 0), [todos])
  const schedule = useMemo(() => todos?.filter(t => t.importance == 0 && t.urgency == 1), [todos])
  const avoid = useMemo(() => todos?.filter(t => t.importance == 1 && t.urgency == 0), [todos])
  const doLater = useMemo(() => todos?.filter(t => t.importance == 1 && t.urgency == 1), [todos])


  const [items, setItems] = useState([0, 1, 2, 3])


  return(
    <div className="w-8/12 flex flex-col gap-3">
      <div className="flex flex-row gap-4 items-center">
        <Tabs defaultValue={"planning"} className="flex flex-row items-center gap-3">
          <TabsList>
            <TabsTrigger className="font-heading text-sm" value="planning">Planning</TabsTrigger>
            <TabsTrigger className="font-heading text-sm" value="executing">Executing</TabsTrigger>
          </TabsList>
          <NavigationMenu>
            <NavigationMenuList>
              <TabsContent value="planning">
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Eisenhower Matrix</NavigationMenuItem>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Opportunity Cost Analysis</NavigationMenuItem>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Reflection</NavigationMenuItem>
              </TabsContent>

              <TabsContent value="executing">
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Calendar</NavigationMenuItem>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Stop Watch</NavigationMenuItem>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Timer</NavigationMenuItem>
              </TabsContent>
            </NavigationMenuList>
          </NavigationMenu>
          <TabsContent value="planning">

          </TabsContent>


        </Tabs>
      </div>


      <div className="grid grid-cols-2 gap-10 h-[75vh] grid-rows-2">
        <EisenhowerBox title="Do Now" droppableId="doNow" todos={doNow} />
        <EisenhowerBox title="Schedule" droppableId="schedule" todos={schedule} />
        <EisenhowerBox title="Avoid" droppableId="avoid" todos={avoid} />
        <EisenhowerBox title="Do later" droppableId="doLater" todos={doLater} />
      </div>
    </div>
  )
}

function EisenhowerBox(props: {title: string, droppableId: string, todos?: Todo[]}) {
  return (
    <div className="flex flex-col gap-2 items-center">
      <h4>{props.title}</h4>
      <Droppable droppableId={props.droppableId}>
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="bg-primary-foreground w-full h-full rounded-xl flex flex-col gap-2 p-3">

            {props.todos?.map((t, index) => t && 
              <Draggable  key={t.id} draggableId={t.id} index={index} >
                {(provided, snapshot) => (

                  <Card ref={provided.innerRef} style={provided.draggableProps.style} {...provided.draggableProps} {...provided.dragHandleProps} className="py-1 px-3">
                    <p>{t.title}</p>
                  </Card>
                )
                }
              </Draggable>

            )}
            {provided.placeholder}
          </div>
        )} 
      </Droppable>

    </div>
  )
}
