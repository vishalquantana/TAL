import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key exists:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables not set!");
  alert("Supabase environment variables not set! Please check your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase client created successfully");

export default supabase;
