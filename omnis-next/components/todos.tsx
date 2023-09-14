'use client'

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { experimental_useOptimistic as useOptimistic, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { Todo } from "@/app/todos";
import { useToast } from "./ui/use-toast";
import revalidate from "@/app/revalidate";

export default function(props: {todos: Todo[] | null, user: User}) {

  const [optimisticMessages, changeOptimistic] = useOptimistic<Todo[] | null, {todo: Todo, delete?: boolean}>(
    props.todos,
    (todos: Todo[] | null, action) => !action.delete ? [...todos ?? [], action.todo] : todos?.filter(t => t!.id !== action.todo!.id) ?? []
  )

  const supabase = createClientComponentClient<Database>()

  const createTodo = async (title: string) => {
    const todo: Todo = {title, is_complete: false, user_id: props.user.id, created_at: (new Date()).toUTCString(), id: crypto.randomUUID()}
    changeOptimistic({todo})

    await supabase.from("todos").insert(todo)
    router.refresh()
  }

  const router = useRouter()
  const {toast} = useToast()
  
  const deleteTodo = async (todo: NonNullable<Todo>) => {
    changeOptimistic({todo, delete: true})

    const {error} = await supabase.from('todos').delete().eq("id", todo.id)
    if (error) console.log(error)

    if (error) {
      toast({
        title: "Database Error",
        description: `Error deleting ${todo.title}: ${error.message}`,
        variant: 'destructive'
      })
    } 

    router.refresh()
  }

  return <>
    <div className="flex flex-col gap-4 w-4/12">
      <h3 className="h-10">Todos</h3>
      <CreateTask createTask={createTodo} />
      {optimisticMessages?.map(t => t && 
        <Card draggable onClick={() => deleteTodo(t)} className="hover:shadow-lg hover:scale-[102%] transition-all hover:cursor-pointer" key={t.id}>
          <CardHeader><CardTitle className="font-sans text-sm">{t.title}</CardTitle></CardHeader>
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
