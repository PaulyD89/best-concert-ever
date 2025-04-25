import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runRefresh() {
  const { error } = await supabase.rpc('refresh_user_stats');
  if (error) {
    console.error('Error running refresh_user_stats:', error);
    process.exit(1);
  } else {
    console.log('Successfully refreshed user stats!');
  }
}

runRefresh();

