import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
    prompt, 
    headliner, 
    opener, 
    secondOpener, 
    userId, 
    decibelScore,
    bonusVotes,
    market
} = req.body;

    // Validate input
    if (!prompt || !headliner || !opener || !secondOpener || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user's IP address (same method as vote.js)
    const userIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
                   || req.headers['x-real-ip'] 
                   || req.connection.remoteAddress 
                   || 'unknown';

    console.log('🎸 Lineup submission attempt from IP:', userIP);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Check if this IP has already submitted a lineup today
    const { data: existingSubmission, error: checkError } = await supabase
      .from('lineups')
      .select('id')
      .eq('ip_address', userIP)
      .eq('prompt', prompt);

    if (checkError) {
      console.error('Error checking existing submissions:', checkError);
      return res.status(500).json({ error: 'Database error checking submissions' });
    }

    // IP rate limit: 1 lineup submission per IP per day
    if (existingSubmission && existingSubmission.length > 0) {
      console.log('⛔ IP already submitted today:', userIP);
      return res.status(429).json({ 
        error: 'This device has already submitted a lineup for today\'s prompt!' 
      });
    }

    // Insert the lineup with IP address
    const { data: inserted, error: insertError } = await supabase
  .from('lineups')
  .insert([{
    prompt: prompt,
    headliner: headliner,
    opener: opener,
    second_opener: secondOpener,
    user_id: userId,
    decibel_score: decibelScore,
    votes: bonusVotes || 0,
    ip_address: userIP,
    market: market || 'US'  // ADD THIS LINE - defaults to US if not provided
  }])
  .select('id')
  .single();

    if (insertError) {
      console.error('Error inserting lineup:', insertError);
      return res.status(500).json({ error: 'Failed to submit lineup' });
    }

    console.log('✅ Lineup submitted successfully from IP:', userIP, 'Lineup ID:', inserted.id);

    return res.status(200).json({ 
      success: true, 
      lineupId: inserted.id 
    });

  } catch (err) {
    console.error('Unexpected error in submit-lineup API:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}