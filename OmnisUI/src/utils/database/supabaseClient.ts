import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
console.log(supabaseUrl)
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
