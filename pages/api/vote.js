import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lineupId, prompt } = req.body;

    // Validate input
    if (!lineupId || !prompt) {
      return res.status(400).json({ error: 'Missing lineupId or prompt' });
    }

    // Get user's IP address
    const userIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
                   || req.headers['x-real-ip'] 
                   || req.connection.remoteAddress 
                   || 'unknown';

    console.log('🔍 Vote attempt from IP:', userIP);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Get the market from the lineup to enforce per-market rate limits
    const { data: lineupData, error: lineupFetchError } = await supabase
      .from('lineups')
      .select('market')
      .eq('id', lineupId)
      .single();

    if (lineupFetchError || !lineupData) {
      console.error('Error fetching lineup for market check:', lineupFetchError);
      return res.status(404).json({ error: 'Lineup not found' });
    }

    const market = lineupData.market || 'US';

    // Check if this IP has already voted today IN THIS MARKET
    const { data: existingVotes, error: checkError } = await supabase
      .from('vote_attempts')
      .select('*')
      .eq('ip_address', userIP)
      .eq('date', today)
      .eq('market', market);

    if (checkError) {
      console.error('Error checking vote attempts:', checkError);
      return res.status(500).json({ error: 'Database error checking votes' });
    }

    // IP rate limit: 1 vote per IP per market per day
    if (existingVotes && existingVotes.length >= 1) {
      console.log('⛔ IP already voted today in market:', userIP, market);
      return res.status(429).json({ 
        error: 'Daily vote limit reached. Come back tomorrow to vote again!' 
      });
    }

    // ===================================================
    // NEW CODE START: Subnet fraud detection
    // ===================================================
    
    // Extract the subnet (first 3 octets of IP address)
    // Example: "172.59.77.106" becomes "172.59.77"
    const ipParts = userIP.split('.');
    const subnet = ipParts.slice(0, 3).join('.');

    // Check how many votes from this subnet for THIS specific lineup today
    const { data: subnetVotes, error: subnetError } = await supabase
      .from('vote_attempts')
      .select('*')
      .eq('lineup_id', lineupId)
      .eq('date', today)
      .ilike('ip_address', `${subnet}.%`);

    if (subnetError) {
      console.error('Error checking subnet votes:', subnetError);
      // Don't block the vote if this check fails, just log it
    } else if (subnetVotes && subnetVotes.length >= 3) {
      // If 3 or more votes from same subnet for same lineup = likely fraud
      console.log('🚨 FRAUD DETECTED: Multiple votes from subnet', subnet, 'for lineup', lineupId);
      console.log('   Previous IPs from this subnet:', subnetVotes.map(v => v.ip_address).join(', '));
      
      return res.status(429).json({ 
        error: 'Suspicious voting pattern detected. Please contact support if this is an error.' 
      });
    }
    
    // ===================================================
    // NEW CODE END
    // ===================================================

    // Get current lineup votes
    const { data: lineup, error: lineupError } = await supabase
      .from('lineups')
      .select('votes')
      .eq('id', lineupId)
      .single();

    if (lineupError || !lineup) {
      console.error('Error fetching lineup:', lineupError);
      return res.status(404).json({ error: 'Lineup not found' });
    }

    // Increment the vote count
    const updatedVotes = (lineup.votes || 0) + 1;
    const { error: voteError } = await supabase
      .from('lineups')
      .update({ votes: updatedVotes })
      .eq('id', lineupId);

    if (voteError) {
      console.error('Error updating votes:', voteError);
      return res.status(500).json({ error: 'Failed to record vote' });
    }

    // Record the vote attempt in our tracking table
    const { error: recordError } = await supabase
      .from('vote_attempts')
      .insert({
        ip_address: userIP,
        lineup_id: lineupId,
        prompt: prompt,
        date: today,
        market: market
      });

    if (recordError) {
      console.error('Error recording vote attempt:', recordError);
      // Don't fail the vote if recording fails, just log it
    }

    console.log('✅ Vote successful from IP:', userIP, 'New vote count:', updatedVotes);

    return res.status(200).json({ 
      success: true, 
      votes: updatedVotes 
    });

  } catch (err) {
    console.error('Unexpected error in vote API:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}