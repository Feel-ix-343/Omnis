'use client'

import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { ReactNode, experimental_useOptimistic as useOptimistic, useEffect, useState, startTransition, useTransition } from 'react';
import { EisenhowerTasks} from './page';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowDownToLine, CheckSquare, PlusCircle, Square, TrashIcon } from 'lucide-react';
import { CheckboxItem } from '@radix-ui/react-context-menu';
import { deleteTodo, newEisenhowerTodo, updateEisenhowerOrdering } from './actions';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export default function(props: {eisenhowerTodos: EisenhowerTasks}) {
  console.log(props.eisenhowerTodos)

  const [todos, setTodos] = useOptimistic(
    props.eisenhowerTodos,
    (old, newList: EisenhowerTasks) => {
      return newList
    }
  )
  // const [todos, setTodos] = useState(props.eisenhowerTodos) // this won't work for optimistic because when ever you set state, props gets read again. 

  const [activeId, setActiveId] = useState<UniqueIdentifier>()
  const activeTask = Object.entries(todos).map(e => e[1]).flat().find(t => t.task_id === activeId)


  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} onDragOver={handleDragOver}>

      <div className="grid grid-cols-2 grid-rows-2 gap-7 w-6/12">

        <MatrixBox priority="do_now" todos={todos.do_now}>
          <SortableContext strategy={verticalListSortingStrategy} items={todos.do_now.map( t => t.task_id )}>
            {todos.do_now.map(t => <Todo key={t.task_id} todo={t}/>)}
          </SortableContext>
        </MatrixBox>

        <MatrixBox priority="do_later" todos={todos.do_later}>
          <SortableContext strategy={verticalListSortingStrategy} items={todos.do_later.map( t => t.task_id )}>
            {todos.do_later.map(t => <Todo key={t.task_id} todo={t}/>)}
          </SortableContext>
        </MatrixBox>

        <MatrixBox priority="delegate" todos={todos.delegate}>
          <SortableContext strategy={verticalListSortingStrategy} items={todos.delegate.map( t => t.task_id )}>
            {todos.delegate.map(t => <Todo key={t.task_id} todo={t}/>)}
          </SortableContext>
        </MatrixBox>

        <MatrixBox priority="dont_do" todos={todos.dont_do}>
          <SortableContext strategy={verticalListSortingStrategy} items={todos.dont_do.map( t => t.task_id )}>
            {todos.dont_do.map(t => <Todo key={t.task_id} todo={t}/>)}
          </SortableContext>
        </MatrixBox>

        <DragOverlay>
          {activeId ? 
            <motion.div 
              className={cn("bg-white shadow-sm border-2 border-slate-200 rounded-lg px-3 py-1")} 
            >
              <h1 className="text-lg font-sans">{activeTask?.task}</h1>
            </motion.div> :
            null
          }
        </DragOverlay>

      </div>

      {activeId && <Trash />}

    </DndContext>
  )

  function findContainer(id: UniqueIdentifier) {
    if (id in todos) {
      return id
    }

    return Object.keys(todos).find(key => todos[key as keyof EisenhowerTasks].findIndex(t => t.task_id === id) !== -1)
  }

  function handleDragStart(event: DragStartEvent) {
    const {active} = event
    setActiveId(active.id)
  }


  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return
    const { id } = active;
    const { id: overId } = over;

    if (overId === "trash") {
      return
    }

    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    console.log({activeContainer, overContainer})

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    console.log("still goign")

    const prev = todos
    const activeItems = prev[activeContainer as keyof EisenhowerTasks];
    const overItems = prev[overContainer as keyof EisenhowerTasks];

    // Find the indexes for the items
    const activeIndex = activeItems.findIndex(t => t.task_id === id);
    const overIndex = overItems.findIndex(t => t.task_id === overId);

    let newIndex;
    if (overId in prev) {
      // We're at the root droppable of a container
      newIndex = overItems.length + 1;
    } else {
      const isBelowLastItem =
        over &&
          overIndex === overItems.length - 1 &&
          active.rect.current.translated!.top > over.rect.top + over.rect.height;

      const modifier = isBelowLastItem ? 1 : 0;

      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;

    }
    const obj = {
      ...prev,
      [activeContainer]: [
        ...prev[activeContainer as keyof EisenhowerTasks].filter((item) => item.task_id !== active.id)
      ],
      [overContainer]: [
        ...prev[overContainer as keyof EisenhowerTasks].slice(0, newIndex),
        prev[activeContainer as keyof EisenhowerTasks][activeIndex],
        ...prev[overContainer as keyof EisenhowerTasks].slice(newIndex, prev[overContainer as keyof EisenhowerTasks].length)
      ]
    }
    startTransition(() => {
      setTodos(obj)
      updateEisenhowerOrdering(obj) // this isin't ideal, but it works
    })
  }


  function handleDragEnd(event: DragEndEvent) {
    if (!event.over) {
      toast({
        title: "You can't drop it there",
      })
      setActiveId(undefined)
      return
    }


    if (event.over.id === "trash") {
      const activeContainer = findContainer(event.active.id)
      startTransition(() => {

        setTodos({
          ...todos,
          [activeContainer as keyof EisenhowerTasks]: todos[activeContainer as keyof EisenhowerTasks].filter(t => t.task_id !== event.active.id)
        })

        deleteTodo(Number(event.active.id))
      })

      setActiveId(undefined)
    }

    const activePriority = findContainer(event.active.id) as keyof EisenhowerTasks
    const overPriority = findContainer(event.over.id) as keyof EisenhowerTasks

    if (
      !activePriority ||
        !overPriority ||
        activePriority !== overPriority
    ) {
      return;
    }

    const activeTodos = props.eisenhowerTodos[activePriority]
    const overTodos = props.eisenhowerTodos[overPriority]

    const activeIndex = activeTodos.findIndex(t => t.task_id === event.active.id)
    const overIndex = overTodos.findIndex(t => t.task_id === event.over!.id)

    if (activeIndex !== overIndex) {
      const newobj = {
        ...props.eisenhowerTodos,
        [overPriority]: arrayMove(props.eisenhowerTodos[overPriority], activeIndex, overIndex)
      }
      startTransition(() => {
        setTodos(newobj)
        updateEisenhowerOrdering(newobj) // this isin't ideal, but it works
      })
    }

    setActiveId(undefined)
  }

}


function MatrixBox(props: {children?: ReactNode, priority: keyof EisenhowerTasks, todos: EisenhowerTasks[keyof EisenhowerTasks]}){
  const {isOver, setNodeRef} = useDroppable({
    id: props.priority
  })

  const [creatingTodo, setCreatingTodo] = useState(false)
  const [todo, setTodo] = useState("")

  const priorityDisplayNames = {
    do_now: "Do Now",
    do_later: "Do Later",
    delegate: "Delegate",
    dont_do: "Don't Do",
  } satisfies Record<keyof EisenhowerTasks, string>


  const newTodo = () => {
    if (!todo) {
      toast({
        title: "You need to enter a todo name",
      })
      return
    }


    newEisenhowerTodo({
      task: todo,
    }, {
        order_id: props.todos.length,
        priority: props.priority,
      }
    ) // get errors

    setTodo("")
  }

  return (
    <div ref={setNodeRef} className={cn("px-5 py-2 rounded-lg mx-auto bg-secondary w-[300px] h-[300px] flex flex-col gap-1")}>
      <h1 className="text-lg">{priorityDisplayNames[props.priority]}</h1>
      {props.children}

      <div className="mt-auto flex flex-row items-end">
        {!creatingTodo && <PlusCircle onClick={() => setCreatingTodo(true)} className="stroke-slate-300 mb-2 absolute" /> }

        <AnimatePresence>
          {creatingTodo && 
            <motion.div layout initial={{width: "0%"}} animate={{width: "100%"}} exit={{width: "0%", opacity: 0}} className={cn("flex items-center")}>
              <Input 
                autoFocus 
                value={todo} 
                onChange={e => setTodo(e.currentTarget.value)} 
                onKeyUp={e => e.key === "Enter" ? newTodo() : null }  
                onBlur={() => setCreatingTodo(false)} 
                type='text' 
                placeholder="Enter Todo Name" 
              />
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>
  )
}


function Todo(props: {todo: EisenhowerTasks[keyof EisenhowerTasks][number]}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    active,
    isDragging,
  } = useSortable({id: props.todo.task_id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <motion.div 
      className={cn("bg-white shadow-sm border-2 border-slate-200 rounded-lg px-3 py-1 flex flex-row items-center gap-2", {"opacity-0": isDragging})} 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
    >
      <h1 className="text-lg font-sans">{props.todo.task}</h1>
    </motion.div>
  )
}

function Trash() {
  const {isOver, setNodeRef} = useDroppable({
    id: "trash"
  })
  return (
    <motion.div 
      animate={{
        scale: isOver ? 1.03 : 1
      }}
      ref={setNodeRef} 
      className={cn("px-5 py-2 rounded-lg mx-auto border w-[500px] mt-10 h-[100px] flex justify-center items-center", {"bg-red-50": isOver, "border-red-200": isOver})}>
      <TrashIcon className={cn("stroke-slate-300 mb-2 absolute", {"stroke-red-200": isOver})} />
    </motion.div>
  )
}
