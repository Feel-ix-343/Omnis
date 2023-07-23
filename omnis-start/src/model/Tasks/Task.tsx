import { AiOutlineCloseCircle, AiOutlineCalendar, AiOutlineUnorderedList, AiOutlinePlusCircle } from "solid-icons/ai"
import { BsFlag, BsHourglass } from "solid-icons/bs"
import { FiTarget } from "solid-icons/fi"
import { IoDocumentTextOutline } from "solid-icons/io"
import { createEffect, createSignal, For, JSXElement } from "solid-js"
import { createStore } from "solid-js/store"
import { createRouteAction, useRouteData } from "solid-start"
import { z } from "zod"
import DatePicker from "~/components/DatePicker"
import { DropDown } from "~/components/Dropdown"
import { UnscheduledTask } from "~/lib/autoscheduling"
import { supabase } from "~/lib/supabaseClient"
import { newNotification, routeData, setPopup } from "~/routes/planning"
import { Step } from "./Step"


type Importance = DBTask["importance"]

export class Task { // This gets passed to the basic list view at the start of planning
  constructor( public data: DBTask) {}


  popupDisplay = (): void => {

    const popupComponent = (): JSXElement => {
      const {allTasks, setOptimisticTasks, refetchTasks} = useRouteData<typeof routeData>()
      const [deleting, deleteTask] = createRouteAction(async () => {
        setPopup()
        setOptimisticTasks(allTasks()?.filter(t => t.data.id !== this.data.id))
        // const {data, error} = await this.delete()
        // if (error) {
        //   newNotification({type: "error", text: "Error Deleting Task: " + error.message})
        //   return
        // } // TODO: OH NO DB IS DOWN!!
        //wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000))
        refetchTasks()
        newNotification({type: "error", text: "Error Deleting Task; Undoing"})
      })

      const [updating, update] = createRouteAction(async (data: typeof this.data) => { // This is kinda part form part signal for the input data
        console.log("Updating Task Data", data)
        setPopup()
        setOptimisticTasks(allTasks()?.map(t => t.data.id === this.data.id ? new Task(data) : t))
        const {error} = await supabase.from("tasks").update(data).eq("id", this.data.id)
        if (error) { 
          newNotification({type: "error", text: "Error Updating Task: " + error.message})
          return
        }
        //wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000))
        refetchTasks()
      })

      const [importance, setImportance] = createSignal<Importance>()
      const [taskDuration, setTaskDuration] = createSignal<number>()

      const [taskData, updateTaskData] = createStore(this.data)

      return <>
        {/* Header */}
        <div class="bg-background-secondary h-[25%] pt-8 pb-4 px-4">


          <div class="flex flex-row items-center mb-2 gap-2">
            <AiOutlineCloseCircle onclick={() => setPopup()} size={50} class="fill-secondary left-6 top-12" />

            <button onclick={() => deleteTask()} class="ml-auto border-2 border-red-300 bg-red-200 rounded-lg px-3 py-1 font-bold text-xl shadow-md">Delete</button>

            <button onclick={() => update(taskData)} class="bg-white rounded-lg px-3 py-1 font-bold text-xl shadow-md">Update</button>

            {/* <button onclick={() => {props.close(); props.onCreate!(getTaskFromInputs())}} class="ml-auto bg-white rounded-lg px-3 py-1 font-bold text-xl shadow-md">Create</button> */}

          </div>

          <input 
            type="text" 
            class="w-full px-4 h-10 py-2 mx-auto font-bold flex justify-center items-center bg-background-secondary text-3xl placeholder-primary" 
            placeholder="Add Task Name" 
            value={taskData.name} 
            onchange={(e) => updateTaskData("name", e.currentTarget.value)}
            name="TaskName"
          />

        </div>

        <div class="overflow-scroll max-h-[75%] pb-20">
          {/* <div class="flex flex-row flex-wrap justify-start items-center text-secondary gap-2 mt-5 px-4"> */}
          {/*   <AiOutlineCalendar size={35} class="fill-secondary" /> */}
          {/**/}
          {/*   <h3 class="text-secondary whitespace-nowrap">This task is due</h3> */}
          {/**/}
          {/*   <DatePicker  */}
          {/*     id="dueDate"  */}
          {/*     class="bg-background-secondary text-primary font-bold px-3 py-1 rounded-xl shadow-md flex items-center border-2 border-neutral-200 w-40"  */}
          {/*     setDate={setDueDate} */}
          {/*     value={dueDate()} */}
          {/*   /> */}
          {/**/}
          {/* </div> */}

          {/* <div class="flex flex-row flex-wrap justify-start items-center text-secondary gap-2 mt-5 px-4"> */}
          {/*   <AiOutlineCalendar size={35} class="fill-secondary" /> */}
          {/**/}
          {/*   <h3 class="text-secondary whitespace-nowrap">Start on</h3> */}
          {/**/}
          {/*   <DatePicker  */}
          {/*     id="startDate"  */}
          {/*     class="bg-background-secondary text-primary font-bold px-3 py-1 rounded-xl shadow-md flex items-center border-2 border-neutral-200 w-40"  */}
          {/*     setDate={setStartDate} */}
          {/*     value={startDate() ?? undefined} // TODO: This is shit */}
          {/*   /> */}
          {/**/}
          {/* </div> */}

          <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
            <BsFlag size={35} class="fill-secondary" />

            <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3">
              This task has 
              <DropDown<Importance>
                choices={[
                  {value: "high", display: "High"},
                  {value: "low", display: "Low"},
                  {value: null, display: "None"}
                ]} 
                choiceOutput={taskData.importance} 
                setChoice={c => updateTaskData("importance", c)}
              >
                Select
              </DropDown>
              importance
            </div>

          </div>

          {/* <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4"> */}
          {/*   <BsHourglass size={35} class="fill-secondary" /> */}
          {/**/}
          {/*   <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3"> */}
          {/**/}
          {/*     It should take */}
          {/**/}
          {/*     {/* {/* TODO: MAke this better */ }
          {/*     <DropDown<number>  */}
          {/*       choices={[ */}
          {/*         {display: "30min", value: 30}, */}
          {/*         {display: "1hr", value: 60}, */}
          {/*         {display: "1.5hr", value: 90}, */}
          {/*         {display: "2hr", value: 120}, */}
          {/*       ]}  */}
          {/*       setChoice={(choice: number) => {  updateTaskData("duration", intervalToMinutes)}}  */}
          {/*       choiceOutput={taskDuration() ? (taskDuration()! / 60 < 1 ? `${taskDuration()!}min` : `${taskDuration()! / 60}hr`) : null} */}
          {/*     > */}
          {/*       Duration */}
          {/*     </DropDown> */}
          {/**/}
          {/*   </div> */}
          {/**/}
          {/* </div> */}

          {/* {allGoals() ?  */}
          {/*   <div class="flex flex-row justify-start items-center text-secondary gap-2 mt-9 px-4"> */}
          {/*     <FiTarget size={30} /> */}
          {/*     <div class="flex flex-row items-center flex-wrap gap-2 gap-y-3"> */}
          {/**/}
          {/*       This is for */}
          {/**/}
          {/*       {/* TODO: MAke this better */ }
          {/*       <DropDown<string | null>  */}
          {/*         choices={[allGoals()!.map(g => {return {display: g.name, value: g.id}}), {display: "None", value: null}].flat()}  */}
          {/*         setChoice={(choice: string | null) => { choice === null ? setGoals(null) : setGoals([choice])}}  */}
          {/*         choiceOutput={goals() ? allGoals()!.find(g => g.id === goals()![0])?.name ?? "None" : "None"} */}
          {/*       > */}
          {/*         Goal */}
          {/*       </DropDown> */}
          {/**/}
          {/*     </div> */}
          {/*   </div> : */}
          {/*   null */}
          {/* } */}

          {/* <div class="flex flex-row justify-start items-center text-secondary font-bold gap-2 mt-9 px-4"> */}
          {/*   <AiOutlineUnorderedList size={20} class="fill-secondary ml-2" /> */}
          {/*   Steps */}
          {/* </div> */}

          {/* <For each={steps()}> */}
          {/*   {(step, index) =>  */}
          {/*     <Step step={step} delete={() => setSteps(steps()?.filter(s => s.id !== step.id))} setStep={(step: NonNullable<UnscheduledTask["steps"]>[0]) => setSteps(steps()!.map((s) => s.id === step.id ? step : s))} /> */}
          {/*   } */}
          {/* </For> */}

          {/* <div class="flex flex-row items-center justify-start w-[90%] mx-auto gap-1 text-secondary"> */}
          {/*   <AiOutlinePlusCircle  */}
          {/*     size={25}  */}
          {/*     class="fill-secondary ml-1"  */}
          {/*     onclick={() => { */}
          {/*       if (steps()) { */}
          {/*         setSteps([...steps()!, {id: crypto.randomUUID(), description: "", duration: 1, completed: false, edited: false}]) */}
          {/*       } else { */}
          {/*         setSteps( [ {id: crypto.randomUUID(), description: "", duration: 1, completed: false, edited: false} ])  */}
          {/*       } */}
          {/*     }} /> */}
          {/* </div> */}

          <div class="flex flex-row justify-start items-start text-secondary gap-2 mt-9 px-4">
            <IoDocumentTextOutline size={35} class="fill-secondary" />

            <textarea

              style={{
                "box-shadow": "inset 0px 3px 4px 1px rgba(0, 0, 0, 0.15)",
              }}

              class="bg-background-secondary p-2 rounded-lg w-full"
              placeholder="Why is this important?" 

              value={taskData.description ?? ""} 

              onChange={(e) => updateTaskData("description", e.currentTarget.value)}
            />

          </div>
        </div>
      </>
    }

    setPopup(prev => popupComponent)
    console.log("done")
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


  getDuration() {
    if (this.data.duration === null) return null

    let minutes = 0;

    const duration = this.data.duration as string
    minutes += parseInt(duration.slice(0, 2)) * 60
    minutes += parseInt(duration.slice(3, 5))
    minutes += parseInt(duration.slice(6, 8)) / 60

    return minutes

    console.log(this.data.duration)

    const pgduration = intervalToMinutes(this.data.duration)
    if (!pgduration) return 15 // Default task length
    return pgduration
  }

  async delete() {
    return await supabase.from("tasks").delete().eq("id", this.data.id)
  }
}

const intervalToMinutes = (interval: unknown) => {
  const zodInterval = z.object({
    hours: z.number().nullish(),
    minutes: z.number().nullish(),
    seconds: z.number().nullish()
  }).nullable()
  const pgduration = zodInterval.parse(interval)
  if (!pgduration) return null

  let minutes: number = 0;
  if (pgduration.hours) minutes += pgduration.hours * 60
  if (pgduration.minutes) minutes += pgduration.minutes;
  if (pgduration.seconds) minutes += pgduration.seconds / 60

  return minutes
}

const tasksQuery = async (id: string) => {
  const {data, error} = await supabase.from("tasks").select("*").eq("user_id", id)
  return data
}

export type DBTask = NonNullable<Awaited<ReturnType<typeof tasksQuery>>>[0]
