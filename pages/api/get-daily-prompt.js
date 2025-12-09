import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { market = 'US' } = req.query;
    
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm = String(today.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(today.getUTCDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    // Determine which table to use based on market
    // GLOBAL users get US prompts for now
    const tableName = market === 'MX' ? 'prompts_mx' 
                    : market === 'BR' ? 'prompts_br'
                    : 'prompts';
    
    console.log(`📅 Fetching prompt from ${tableName} for ${formattedDate}`);

    const { data, error } = await supabase
      .from(tableName)
      .select("prompt, locked_headliner_data")
      .eq("prompt_date", formattedDate)
      .single();

    if (error || !data) {
      console.error(`Failed to fetch prompt from ${tableName}:`, error);
      return res.status(404).json({ 
        error: 'Prompt not found',
        details: error?.message 
      });
    }

console.log(`✅ Prompt loaded: ${data.prompt}`);

// Calculate seconds until next midnight UTC
const now = new Date();
const tomorrow = new Date(now);
tomorrow.setUTCHours(24, 0, 0, 0); // Next midnight UTC
const secondsUntilMidnight = Math.floor((tomorrow - now) / 1000);

// Cache until midnight UTC (when prompt changes)
res.setHeader('Cache-Control', `public, s-maxage=${secondsUntilMidnight}, stale-while-revalidate=300`);
    
    return res.status(200).json({ 
      prompt: data.prompt, 
      lockedHeadliner: data.locked_headliner_data || null 
    });

  } catch (error) {
    console.error('Error in get-daily-prompt:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}