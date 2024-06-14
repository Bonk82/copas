
import { createClient } from "@supabase/supabase-js";
console.log('cliente',import.meta.env.VITE_REACT_APP_SUPABASE_URL)

export const supabase = createClient(
  import.meta.env.VITE_REACT_APP_SUPABASE_URL,
  import.meta.env.VITE_REACT_APP_SUPABASE_ANON_KEY
);