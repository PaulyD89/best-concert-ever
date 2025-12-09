import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { market, timeframe } = req.query;
  
  // Validate inputs
  if (!market || !timeframe) {
    return res.status(400).json({ error: 'Missing market or timeframe parameter' });
  }
  
  if (!['US', 'MX', 'BR'].includes(market)) {
    return res.status(400).json({ error: 'Invalid market. Must be US, MX, or BR' });
  }
  
  if (!['weekly', 'monthly'].includes(timeframe)) {
    return res.status(400).json({ error: 'Invalid timeframe. Must be weekly or monthly' });
  }
  
  try {
    const { data, error } = await supabase
      .from('leaderboard_cache')
      .select('data, last_updated')
      .eq('market', market)
      .eq('timeframe', timeframe)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ error: 'Leaderboard not found' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'No leaderboard data available' });
    }
    
    return res.status(200).json({
      leaderboard: data.data,
      last_updated: data.last_updated
    });
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}