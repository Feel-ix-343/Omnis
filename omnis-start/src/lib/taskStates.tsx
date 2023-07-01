import { PostgrestError, Session } from "@supabase/supabase-js";
import { JSX, JSXElement } from "solid-js";
import { DataResponse, Lazy } from "~/utils/types";
import { Database } from "../../../supabase/database.types";
import { supabase } from "./supabaseClient";
import {z } from 'zod'
import { AiFillPauseCircle, AiFillPlayCircle } from "solid-icons/ai";
import { IoCheckmarkCircleOutline } from "solid-icons/io";


/**

*/




// the thing is that this is a task that all other states could be viewed as. It is almost like a parent to all other states. However the children would overload som eo

// But should it implement state? Ill just go with no for now. It will probably make more sense later

// But what about transitions? If I put transitions in this, then say I add an archived state (this is likely because of the state pattern I have already identified), then I would have to add a to archived transition in this interface, and then I would have to update code from all of the classes that transition there. Well I going to have to write the code anyway but it would be simpler if I didn't have to modify my old classes. Would it though? What would change after you add an onArchived? On the model you would add a new state class (Good), add new onArchived methods in relevant existing state classes(bad), and update the UI to display the new transition button(bad). However, I don't even know how I would make popups for the transitions with parameters and stuff in this, maybe it is just too complicated. OR you could make state transition classes for each transition type with their own buttons, transition popups (when necessary), and transition logic (like current time for start working class). But how would the UI know which ones are related to each *state* interface? Couldn't it just be an array on the state interface? No because this breaks OCP again. Could it be a map or something? Maybe but then I would need to have enum identifiers for each state. Is this bad? how would it work? So make an enum of all states. There will be a map of each state to a list of the transitions. The UI will display each of these transitions.  Lets just not worry about transitions for now and try to get this shit rendered, then implement states later. 











// TODO: Do you need to implement both of them if they extend each other? The planning view will only get the non schedulable one (I think). 

// TODO: Figure out how to schedule this thang.



