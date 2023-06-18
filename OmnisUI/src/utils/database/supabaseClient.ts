import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

console.log("Supabase URL url", import.meta.env.VITE_SUPABASE_URL)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
console.log("TEST", supabaseUrl)
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
