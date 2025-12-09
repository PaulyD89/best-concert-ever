import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // We'll add this env var next
);

export default async function handler(req, res) {
  // Simple security - we'll improve this later
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🔄 Starting leaderboard update...');
  
  const markets = ['US', 'MX', 'BR'];
  const results = [];

  for (const market of markets) {
    console.log(`📊 Processing market: ${market}`);
    
    // WEEKLY LEADERBOARD
    const weeklyData = await calculateLeaderboard(market, 7);
    await supabase
      .from('leaderboard_cache')
      .upsert({
        market,
        timeframe: 'weekly',
        data: weeklyData,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'market,timeframe'
      });
    
    // MONTHLY LEADERBOARD
    const monthlyData = await calculateLeaderboard(market, 30);
    await supabase
      .from('leaderboard_cache')
      .upsert({
        market,
        timeframe: 'monthly',
        data: monthlyData,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'market,timeframe'
      });
    
    results.push({ 
      market, 
      weekly: weeklyData.length, 
      monthly: monthlyData.length 
    });
    
    console.log(`✅ ${market} complete - Weekly: ${weeklyData.length}, Monthly: ${monthlyData.length}`);
  }

  console.log('🎉 Leaderboard update complete!');
  
  return res.status(200).json({ 
    success: true, 
    updated: new Date().toISOString(),
    results 
  });
}

async function calculateLeaderboard(market, daysBack) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);
  
  console.log(`  📅 Fetching lineups from ${dateThreshold.toISOString()} for ${market}...`);
  
  // Fetch all lineups from timeframe
  let allLineups = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error } = await supabase
      .from("lineups")
      .select("user_id, votes, created_at")
      .eq("market", market)
      .gte("created_at", dateThreshold.toISOString())
      .range(from, from + pageSize - 1);
    
    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      allLineups = allLineups.concat(data);
      from += pageSize;
      hasMore = data.length === pageSize;
    }
  }
  
  console.log(`  📦 Found ${allLineups.length} lineups`);
  
  if (allLineups.length === 0) return [];
  
  // Get unique user IDs
  const uniqueUserIds = [...new Set(allLineups.map(l => l.user_id))];
  console.log(`  👥 ${uniqueUserIds.length} unique users`);
  
  // Fetch nicknames in batches
  const batchSize = 50;
  const allUsers = [];
  
  for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
    const batch = uniqueUserIds.slice(i, i + batchSize);
    const { data } = await supabase
      .from("users")
      .select("user_id, nickname")
      .in("user_id", batch)
      .not("nickname", "is", null);
    
    if (data) allUsers.push(...data);
  }
  
  console.log(`  ✅ ${allUsers.length} users with nicknames`);
  
  // Create nickname map
  const nicknameMap = {};
  allUsers.forEach(user => {
    nicknameMap[user.user_id] = user.nickname;
  });
  
  // Aggregate votes per user
  const userStatsMap = {};
  
  allLineups.forEach(lineup => {
    const userId = lineup.user_id;
    const nickname = nicknameMap[userId];
    
    if (!nickname) return;
    
    if (!userStatsMap[userId]) {
      userStatsMap[userId] = {
        userId: userId,
        nickname: nickname,
        totalPoints: 0,
        totalVotes: 0,
        lineupsSubmitted: 0
      };
    }
    
    const votes = lineup.votes || 0;
    userStatsMap[userId].totalPoints += votes;
    userStatsMap[userId].totalVotes += votes;
    userStatsMap[userId].lineupsSubmitted += 1;
  });
  
  // Sort and return top 10
  const topPromoters = Object.values(userStatsMap)
    .filter(user => user.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10);
  
  return topPromoters;
}