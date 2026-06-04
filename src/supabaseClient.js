import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: 'sb-study-companion',
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});