import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not set. " +
    "Copy .env.example to .env and fill in your project URL and anon key."
  );
}

/**
 * Usage:
 *   import { supabase } from "@/lib/supabase";
 *   const { data } = await supabase.from("some_table").select("*");
 */
export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);
