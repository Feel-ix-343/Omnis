import { describe, expect, expectTypeOf, it } from "vitest";
import { supabase } from "~/lib/supabaseClient";


const seedUserID = '8122fefc-8817-4db7-bb91-5bc7f2116f7d'

describe("Supabase Client DB Tests", () => {
  it("Get the ID's of the user's 5 tasks", async () => {

    const {data: tasks, error} = await supabase.from("tasks").select("id").eq("user_id", seedUserID)

    expect(error).toBeNull()
    expect(tasks).toStrictEqual([ { id: 1 }, { id: 2 }, { id: 3 }, { id: 5 }, { id: 4 } ])

  })

  it("Get the user's objectives' names associated with task 3 in one query", async () => {

    const {data: objectives, error} = await supabase.from("tasks")
      .select("objectives (name)") // This is a many to many relationship going through the tasks_objective table
      .eq("id", 3)
      .single()
      

    expect(error).toBeNull()
    expect(objectives?.objectives).toStrictEqual([ { name: 'Mindfullness' }, { name: 'College Application' } ])

  })

})
