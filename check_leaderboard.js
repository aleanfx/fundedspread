const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeaderboard() {
  const { data, error } = await supabase
    .from('leaderboard_traders')
    .select('*')
    .eq('user_id', '44e1de2c-ed20-4473-8178-654565e45e6a')
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Leaderboard Data for Jose:', data);
  }
}

checkLeaderboard();
