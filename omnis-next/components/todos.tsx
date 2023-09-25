'use client'

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, experimental_useOptimistic as useOptimistic, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { toast, useToast } from "./ui/use-toast";
import revalidate from "@/app/revalidate";
import useTodos, { Todo } from "@/hooks/useTodos";
import TodosSkeleton from "./todos-skeleton";
import { Draggable, Droppable } from "react-beautiful-dnd";
import dayjs from "dayjs";
import { BoxSelect, CheckCheck, CheckIcon, CheckSquare, LucideTrash, Trash, Trash2, Trash2Icon, TrashIcon } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";

export default function(props: {user: User}) {

  const {data: todos, isLoading, mutate} = useTodos()
  useEffect(() => console.log("Cached todos", todos), [todos])

  const nonPrioritized = todos?.filter(t => t.importance === null && t.urgency === null)
  const prioritized = todos?.filter(t => t.importance !== null || t.urgency !== null)



  const {toast} = useToast()
  

  if (isLoading && (todos === null || todos === undefined)) return <TodosSkeleton />
  return <div className="grid grid-flow-col gap-5 overflow-x-scroll">
    <TaskColumn date={dayjs().format("YYYY-MM-DD")} nonPrioritized={nonPrioritized?.filter(t => dayjs(t.scheduled_date).isSame(dayjs(), 'day')) ?? []} prioritized={prioritized?.filter(t => dayjs(t.scheduled_date).isSame(dayjs(), 'day')) ?? []} user={props.user} />
    <TaskColumn date={dayjs().add(1, 'day').format("YYYY-MM-DD")} nonPrioritized={nonPrioritized?.filter(t => dayjs(t.scheduled_date).isSame(dayjs().add(1, 'day'), 'day')) ?? []} prioritized={prioritized?.filter(t => dayjs(t.scheduled_date).isSame(dayjs().add(1, 'day'), 'day')) ?? []} user={props.user} />
    <TaskColumn date={dayjs().add(2, 'day').format("YYYY-MM-DD")} nonPrioritized={nonPrioritized?.filter(t => dayjs(t.scheduled_date).isSame(dayjs().add(2, 'day'), 'day')) ?? []} prioritized={prioritized?.filter(t => dayjs(t.scheduled_date).isSame(dayjs().add(1, 'day'), 'day')) ?? []} user={props.user} />
    <TaskColumn date={dayjs().add(3, 'day').format("YYYY-MM-DD")} nonPrioritized={nonPrioritized?.filter(t => dayjs(t.scheduled_date).isSame(dayjs().add(3, 'day'), 'day')) ?? []} prioritized={prioritized?.filter(t => dayjs(t.scheduled_date).isSame(dayjs().add(1, 'day'), 'day')) ?? []} user={props.user} />
  </div>
}

function TaskColumn(props: {date: string, nonPrioritized: Todo[], prioritized: Todo[], user: User}) {
  let {nonPrioritized, prioritized} = props
  prioritized = prioritized.slice().sort((a, b) => a.index - b.index)
  nonPrioritized = nonPrioritized.slice().sort((a, b) => a.index - b.index)
  const {data: todos, isLoading, mutate} = useTodos()
  const supabase = createClientComponentClient<Database>()

  const createTodo = async (title: string) => {
        const id = crypto.randomUUID()
    mutate(

      async () => {
        const {data: maxIndex} = await supabase.rpc("max_index", {the_date: props.date})
        const {data} = await supabase.from("todos").insert({id, title, index: (maxIndex !== null) ? maxIndex + 1 : 0, scheduled_date: props.date}).select().single()
      }, {
        optimisticData: d => [...d ?? [], {id, title: title, is_complete: false, index: 2000, urgency: null, importance: null, scheduled_date: props.date}],
        revalidate: true,
        populateCache: false,
      })
  }

  const deleteTodo = async (todo: NonNullable<Todo>) => {
    const deleteDB = async () => {
      const {error} = await supabase.from('todos').delete().eq("id", todo.id)
      await supabase.rpc('decrement_below', {starting: todo.index, inclusive: false, list_date: todo.scheduled_date!})

      if (error) {
        toast({
          title: "Database Error",
          description: `Error deleting ${todo.title}: ${error.message}`,
          variant: 'destructive'
        })
      } 
    }

    mutate(deleteDB, {optimisticData: c => c ? c.filter(t => t.id !== todo.id) : null, populateCache: false})
  }

  const toggleComplete = async (todo: NonNullable<Todo>) => {
    mutate(async () => {
      const {error} = await supabase.from('todos').update({is_complete: !todo.is_complete}).eq('id', todo.id)
      error && toast({
        title: "Database Error",
        description: `Error toggling complete for ${todo.title}: ${error?.message}`,
        variant: 'destructive'
      })
    }, {
        optimisticData: c => c?.map(to => to.id === todo.id ? {...to, is_complete: !to.is_complete} : to) ?? [], 
      populateCache: false})
  }

  return <>
    <div className="flex flex-col gap-4 w-[350px]">
      <h3 className="h-10">{props.date}</h3>
      <CreateTask createTask={createTodo} />
      <Droppable droppableId={props.date}>
        {(provided, snapshot) => (
          <ScrollArea {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col h-[67vh]">
            {nonPrioritized?.map((t, index) => t && 
              <Draggable key={t.id} draggableId={JSON.stringify(t)} index={index}>
                {(provided, snapshot) => 
                  <Card 
                    ref={provided.innerRef} 
                    {...provided.dragHandleProps} 
                    {...provided.draggableProps} 
                    draggable 

                    // onClick={() => mutate(
                    //   async () => {
                    //     await supabase.from('todos').upsert({id: t.id, importance: 0, urgency: 0})
                    //   }, 
                    //   {
                    //     optimisticData: c => c?.map(to => to.id === t.id ? {...to, importance: 0, urgency: 0} satisfies Todo : to) ?? [], 
                    //     populateCache: false
                    //   }
                    // )} 

                    className="hover:shadow-lg hover:cursor-pointer mb-3 flex flex-row items-center px-3" 
                    key={t.id}
                  >
                    {!t.is_complete ? <BoxSelect onClick={() => toggleComplete(t)} /> : <CheckSquare onClick={() => toggleComplete(t)} />}
                    <CardHeader><CardTitle className="font-sans text-sm">{t.title}</CardTitle></CardHeader>
                    <Trash2 onClick={() => deleteTodo(t)} className="ml-auto" />
                  </Card>
                }
              </Draggable>
            )}
            {provided.placeholder}
          </ScrollArea>
        )

        }
      </Droppable>
      {prioritized?.map(t => t && 
        <Card 
          draggable 
          onClick={() => mutate(async () => {
            await supabase.from('todos').upsert({id: t.id, importance: null, urgency: null})
          }, {
              optimisticData: c => c?.map(to => to.id === t.id ? {...to, importance: null, urgency: null} satisfies Todo : to) ?? [], populateCache: false
            })}
          className="hover:shadow-lg hover:scale-[102%] transition-all hover:cursor-pointer bg-secondary" key={t.id}>
          <CardHeader>
            <CardTitle className="font-sans text-sm">{t.title}</CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  </>
}

function CreateTask(props: {createTask: (t: string) => void}) {
  const [creating, setCreating] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState<string | null>(null)
  return <>
    {!creating ? 
      <Card draggable className="bg-secondary transition-shadow hover:cursor-pointer" onClick={() => setCreating(true)} key="new">
        <CardHeader><CardTitle className="font-sans text-sm">New Todo</CardTitle></CardHeader>
      </Card>
      :
      <Card draggable className="bg-secondary transition-shadow hover:cursor-pointer shadow-lg" key="new">
        <CardHeader><CardTitle className="font-sans text-sm"><Input autoFocus placeholder="Todo Name" value={newTaskTitle ?? undefined} onChange={e => setNewTaskTitle(e.target.value)} className="bg-secondary focus:bg-white" /></CardTitle></CardHeader>

        <CardFooter>
          <Button variant="outline" className="ml-auto" onClick={() =>{setNewTaskTitle(""); setCreating(false); newTaskTitle && props.createTask(newTaskTitle)}}>Save</Button>
        </CardFooter>
      </Card>
    }
  </>
}
