import { supabase } from './src/supabaseClient.js';

async function test() {
  const { data, error } = await supabase.from('schedules').select('*');
  if (error) console.log('Error:', error);
  else console.log('Data:', data);
}

test();