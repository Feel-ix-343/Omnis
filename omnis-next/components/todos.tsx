'use client'

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { experimental_useOptimistic as useOptimistic, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";
import revalidate from "@/app/revalidate";
import useTodos, { Todo } from "@/hooks/useTodos";
import TodosSkeleton from "./todos-skeleton";
import { Draggable, Droppable } from "react-beautiful-dnd";

export default function(props: {user: User}) {

  const {data: todos, isLoading, mutate} = useTodos()
  console.log("todos", todos)

  const nonPrioritized = todos?.filter(t => t.importance === null && t.urgency === null)
  const prioritized = todos?.filter(t => t.importance !== null || t.urgency !== null)
  console.log(todos)

  const supabase = createClientComponentClient<Database>()

  const createTodo = async (title: string) => {
    const todo: Todo = {title, is_complete: false, user_id: props.user.id, created_at: (new Date()).toUTCString(), id: crypto.randomUUID(), urgency: null, importance: null}
    mutate(async () => await supabase.from("todos").insert(todo), {optimisticData: [...todos ?? [], todo], populateCache: false, revalidate: true})
  }

  const {toast} = useToast()
  
  const deleteTodo = async (todo: NonNullable<Todo>) => {
    const deleteDB = async () => {
      const {error} = await supabase.from('todos').delete().eq("id", todo.id)
      if (error) console.log(error)

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

  if (isLoading && (todos === null || todos === undefined)) return <TodosSkeleton />
  return <>
    <div className="flex flex-col gap-4 w-4/12">
      <h3 className="h-10">Todos</h3>
      <CreateTask createTask={createTodo} />
      <Droppable droppableId="allTodos">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-4">
            {nonPrioritized?.map((t, index) => t && 
              <Draggable key={t.id} draggableId={JSON.stringify(t)} index={index}>
                {(provided, snapshot) => 
                  <Card 
                    ref={provided.innerRef} 
                    {...provided.dragHandleProps} 
                    {...provided.draggableProps} 
                    draggable 

                    onClick={() => mutate(
                      async () => {
                        await supabase.from('todos').upsert({id: t.id, importance: 0, urgency: 0})
                      }, 
                      {
                        optimisticData: c => c?.map(to => to.id === t.id ? {...to, importance: 0, urgency: 0} satisfies Todo : to) ?? [], 
                        populateCache: false
                      }
                    )} 

                    className="hover:shadow-lg hover:scale-[102%] transition-all hover:cursor-pointer" 
                    key={t.id}
                  >
                    <CardHeader><CardTitle className="font-sans text-sm">{t.title}</CardTitle></CardHeader>
                  </Card>
                }
              </Draggable>
            )}
            {provided.placeholder}
          </div>
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
