import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

async function fetchDatabasePrompt(market = 'US') {
  const today = new Date();
  const yyyy = today.getUTCFullYear();
  const mm = String(today.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(today.getUTCDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;

  // Determine which table to use based on market
  // GLOBAL users get US prompts for now
  const tableName = market === 'MX' ? 'prompts_mx' : 'prompts';
  
  console.log(`📅 Fetching prompt from ${tableName} for ${formattedDate}`);

  const { data, error } = await supabase
    .from(tableName)
    .select("prompt, locked_headliner_data")
    .eq("prompt_date", formattedDate)
    .single();

  if (error || !data) {
    console.error(`Failed to fetch prompt from ${tableName}:`, error);
    return null;
  }

  console.log(`✅ Prompt loaded: ${data.prompt}`);
  return { prompt: data.prompt, lockedHeadliner: data.locked_headliner_data || null };
}

const ArtistSearch = ({ label, onSelect, disabled, locked }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
      setShowDropdown(true);
    };
    
    const delayDebounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="relative w-full">
  <input
    type="text"
    placeholder={label}
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    disabled={disabled}
    className="w-full px-4 py-3 border-2 border-white rounded-md bg-transparent 
            focus:outline-none focus:ring-2 focus:ring-yellow-400 
            text-white placeholder-white/70 font-semibold text-sm pr-10"
  />
  {locked && (
    <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
      🔒
    </div>
  )}
      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-scroll shadow-xl">
          {results.map((artist) => (
            <li
              key={artist.id}
              onClick={() => {
                onSelect({
                  name: artist.name,
                  image: artist.images?.[0]?.url,
                  url: artist.external_urls?.spotify,
                  followers: artist.followers?.total || 0,
                  spotifyId: artist.id
                });                              
              setQuery("");
              setShowDropdown(false);
            }}
              className="p-2 hover:bg-yellow-100 cursor-pointer flex items-center gap-2 text-sm"
            >
              {artist.images?.[0]?.url && (
                <img src={artist.images[0].url} alt={artist.name} className="w-6 h-6 rounded-full" />
              )}
              {artist.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const LineupSlot = ({ artist, label }) => (
  <div className="flex flex-col items-center">
 <div
  className={`${
    label === "Headliner" ? "w-51 h-51 shadow-[0_0_15px_4px_rgba(253,224,71,0.8)]" : "w-32 h-32"
  } bg-gray-200 border-2 border-black rounded-md overflow-hidden flex items-center justify-center`}
>
  {artist?.image ? (
    <img
    src={artist.image}
      alt={artist.name}
      className="w-full h-full object-cover"
      crossOrigin="anonymous"
    />
  ) : (
    <span className="text-black text-xs font-bold text-center w-full text-center block">{label}</span>
  )}
</div>
<div className="mt-2 text-white font-bold text-center max-w-[8rem]">
  {artist?.name || ""}
</div>
  </div>
);

export default function BestConcertEver() {
  const [dailyPrompt, setDailyPrompt] = useState(null);
  const [userMarket, setUserMarket] = useState('US');
  const [lockedHeadliner, setLockedHeadliner] = useState(null);
  const [yesterdayPrompt, setYesterdayPrompt] = useState(null);
  const [weeklyTopPromoters, setWeeklyTopPromoters] = useState([]);
  const [monthlyTopPromoters, setMonthlyTopPromoters] = useState([]);
  const [showMonthlyLeaderboard, setShowMonthlyLeaderboard] = useState(false);
  const [selectedPromoter, setSelectedPromoter] = useState(null);
  const [showPromoterModal, setShowPromoterModal] = useState(false);
  const [promoterDetails, setPromoterDetails] = useState(null);

// ============================================
// MARKET DETECTION
// ============================================
async function detectUserMarket() {
  try {
    // Check if we already detected the market
    const storedMarket = localStorage.getItem('bce_market');
    if (storedMarket) {
      console.log('✅ Market from cache:', storedMarket);
      return storedMarket;
    }

    console.log('🌍 Detecting user market...');
    
    // Use ipapi.co for geolocation (free: 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    console.log('📍 Location data:', data.country_code, data.country_name);
    
    // Determine market based on country code
let market;
if (data.country_code === 'MX') {
  market = 'MX';
} else if (data.country_code === 'US') {
  market = 'US';
} else {
  market = 'GLOBAL';
}
    
    // Store in localStorage to avoid repeated API calls
    localStorage.setItem('bce_market', market);
    
    console.log('✅ Market detected:', market);
    return market;
  } catch (error) {
    console.error('❌ Market detection failed:', error);
    // Default to US if detection fails
    localStorage.setItem('bce_market', 'US');
    return 'US';
  }
}

// Detect market on component mount
useEffect(() => {
  async function initMarket() {
    const market = await detectUserMarket();
    setUserMarket(market);
    
    // Optional: Track in analytics
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Market Detected", { props: { market } });
    }
  }
  
  initMarket();
}, []);

// ============================================
// END MARKET DETECTION
// ============================================

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const restoreId = params.get("restore");

  if (restoreId && /^[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$/i.test(restoreId)) {
    try {
      // Save the old user_id into localStorage
      localStorage.setItem("bce_user_id", restoreId);

      // Track restore link usage
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Restore Link Used");
      }

      // Clean up the URL so the restore code disappears
      window.history.replaceState({}, "", window.location.pathname);

      // Optional: give quick feedback before reload
      alert("✅ Your progress has been restored! The page will reload.");

      // Reload to re-fetch stats with the restored ID
      window.location.reload();
    } catch (err) {
      console.error("Restore failed:", err);
    }
  }
}, []);

useEffect(() => {
  async function initializePromptAndLineups() {
    const today = new Date();
    const cutoff = new Date("2025-05-01T00:00:00Z");

    const todayDateString = today.toISOString().split('T')[0];
    const storedPromptDate = localStorage.getItem('lastPromptDate');

    if (storedPromptDate !== todayDateString) {
  localStorage.removeItem('ticketReadyToday');
  localStorage.removeItem('lineupReadyToday');
  localStorage.removeItem('fromSocialVote');
  localStorage.removeItem('socialVoteLineupId');
  localStorage.setItem('lastPromptDate', todayDateString);
}

    let promptToUse = "";

if (today >= cutoff) {
  // Pass userMarket to fetch the right prompt
  const dbPromptData = await fetchDatabasePrompt(userMarket);
if (dbPromptData) {
  console.log("✅ Prompt pulled from Supabase DB:", dbPromptData.prompt);
  promptToUse = dbPromptData.prompt;
  if (dbPromptData.lockedHeadliner) {
    setHeadliner(dbPromptData.lockedHeadliner);
    setLockedHeadliner(dbPromptData.lockedHeadliner);
  }
} else {
    console.error("⚠️ No prompt found for today in database.");
  }
} else {
  // Before May 1 fallback (optional, historical safety)
  promptToUse = getDailyPrompt();
}

setDailyPrompt(promptToUse);
  }

  // Only initialize once market is detected
  if (userMarket) {
    initializePromptAndLineups();
  }
}, [userMarket]);

useEffect(() => {
  const todayDate = new Date().toISOString().split('T')[0];
  const storedPromptDate = localStorage.getItem('lastPromptDate');
  const storedTicketReady = localStorage.getItem('ticketReadyToday') === 'true';

  if (storedPromptDate === todayDate && storedTicketReady) {
    setTicketReady(true);
  }
}, []);

useEffect(() => {
  const timeout = setTimeout(() => {
    const todayDate = new Date().toISOString().split('T')[0];
    const storedPromptDate = localStorage.getItem('lastPromptDate');
    const storedLineupReady = localStorage.getItem('lineupReadyToday') === 'true';

    if (storedPromptDate === todayDate && storedLineupReady) {
      setTicketReady(true);
      setLineupReady(true);
    }
  }, 200);

  return () => clearTimeout(timeout);
}, []);

const fetchDeepCutLineup = async () => {
  const now = new Date();
  const utcMidnight = new Date();
  utcMidnight.setUTCHours(0, 0, 0, 0);

  const tenHoursLater = new Date(utcMidnight.getTime() + 10 * 60 * 60 * 1000);

  if (now < tenHoursLater) return;

  const { data, error } = await supabase
    .from("lineups")
    .select("id, headliner, opener, second_opener, votes")
    .eq("prompt", dailyPrompt);

  if (error || !data) return;

  const eligible = data.filter(lineup => {
    const totalFollowers =
      (lineup.headliner?.followers || 0) +
      (lineup.opener?.followers || 0) +
      (lineup.second_opener?.followers || 0);
    return totalFollowers < 250000;
  });

  if (eligible.length > 0) {
    const randomIndex = Math.floor(Math.random() * eligible.length);
    setDeepCutLineup(eligible[randomIndex]);
  }
};

const fetchWeeklyTopPromoters = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateString = sevenDaysAgo.toISOString();
    
    console.log("📅 Fetching promoters from:", dateString);
    
  // Fetch all lineups from last 7 days with pagination
    let allLineups = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: recentLineups, error: lineupsError } = await supabase
        .from("lineups")
        .select("user_id, votes, created_at")
        .gte("created_at", dateString)
        .range(from, from + pageSize - 1);
      
      if (lineupsError) {
        console.error("❌ Lineups error:", lineupsError);
        break;
      }
      
      if (!recentLineups || recentLineups.length === 0) {
        hasMore = false;
      } else {
        allLineups = allLineups.concat(recentLineups);
        from += pageSize;
        hasMore = recentLineups.length === pageSize;
      }
    }
    
    if (allLineups.length === 0) {
      console.log("📊 No recent lineups found");
      return [];
    }
    
    console.log(`📊 [WEEKLY] Found ${allLineups.length} recent lineups`);
    
    // Get unique user IDs
    const uniqueUserIds = [...new Set(allLineups.map(l => l.user_id))];
    console.log(`👥 Unique users: ${uniqueUserIds.length}`);
    
    // Fetch users with nicknames in batches
    const batchSize = 50;
    const allUsers = [];
    
    for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
      const batch = uniqueUserIds.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from("users")
        .select("user_id, nickname")
        .in("user_id", batch)
        .not("nickname", "is", null);
      
      if (!error && data) {
        allUsers.push(...data);
      }
    }
    
    console.log(`✅ Found ${allUsers.length} users with nicknames`);
    
    if (allUsers.length === 0) {
      console.log("No users with nicknames");
      return [];
    }
    
    // Create nickname map
    const nicknameMap = {};
    allUsers.forEach(user => {
      nicknameMap[user.user_id] = user.nickname;
    });
    
    // Aggregate votes per user (only those with nicknames)
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
      userStatsMap[userId].totalPoints += votes; // Using votes as points
      userStatsMap[userId].totalVotes += votes;
      userStatsMap[userId].lineupsSubmitted += 1;
    });
    
    // Sort and return top 10
    const usersWithPoints = Object.values(userStatsMap).filter(user => user.totalPoints > 0);
    console.log(`🔥 Users with points: ${usersWithPoints.length}`);
    
    const topPromoters = usersWithPoints
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
    
    console.log(`🏆 Top 10 promoters:`, topPromoters);
    
    return topPromoters;
    
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return [];
  }
};

const fetchMonthlyTopPromoters = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateString = thirtyDaysAgo.toISOString();
    
    console.log("📅 Fetching monthly promoters from:", dateString);
    
  // Fetch all lineups from last 30 days with pagination
    let allLineups = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: recentLineups, error: lineupsError } = await supabase
        .from("lineups")
        .select("user_id, votes, created_at")
        .gte("created_at", dateString)
        .range(from, from + pageSize - 1);
      
      if (lineupsError) {
        console.error("❌ Lineups error:", lineupsError);
        break;
      }
      
      if (!recentLineups || recentLineups.length === 0) {
        hasMore = false;
      } else {
        allLineups = allLineups.concat(recentLineups);
        from += pageSize;
        hasMore = recentLineups.length === pageSize;
      }
    }
    
    if (allLineups.length === 0) {
      console.log("📊 No recent lineups found");
      return [];
    }
    
    console.log(`📊 [MONTHLY] Found ${allLineups.length} recent lineups`);
    
    // Get unique user IDs
    const uniqueUserIds = [...new Set(allLineups.map(l => l.user_id))];
    console.log(`👥 Unique users: ${uniqueUserIds.length}`);
    
    // Fetch users with nicknames in batches
    const batchSize = 50;
    const allUsers = [];
    
    for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
      const batch = uniqueUserIds.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from("users")
        .select("user_id, nickname")
        .in("user_id", batch)
        .not("nickname", "is", null);
      
      if (!error && data) {
        allUsers.push(...data);
      }
    }
    
    console.log(`✅ Found ${allUsers.length} users with nicknames`);
    
    if (allUsers.length === 0) {
      console.log("No users with nicknames");
      return [];
    }
    
    // Create nickname map
    const nicknameMap = {};
    allUsers.forEach(user => {
      nicknameMap[user.user_id] = user.nickname;
    });
    
    // Aggregate votes per user (only those with nicknames)
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
    const usersWithPoints = Object.values(userStatsMap).filter(user => user.totalPoints > 0);
    console.log(`🔥 Users with points: ${usersWithPoints.length}`);
    
    const topPromoters = usersWithPoints
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
    
    console.log(`🏆 Top 10 monthly promoters:`, topPromoters);
    
    return topPromoters;
    
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return [];
  }
};

const fetchPromoterDetails = async (userId) => {
  // Fetch from user_stats table (not users table)
  const { data: userStats, error: statsError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (statsError) {
    console.error("Error fetching user stats:", statsError);
    return null;
  }
  
  // Also get nickname from users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("nickname")
    .eq("user_id", userId)
    .single();
  
  // Get their most voted lineup
  const { data: topLineup, error: lineupError } = await supabase
    .from("lineups")
    .select("headliner, opener, second_opener, votes, prompt")
    .eq("user_id", userId)
    .order("votes", { ascending: false })
    .limit(1)
    .single();
  
  // Get their highest decibel score
  const { data: highestDecibelData, error: decibelError } = await supabase
    .from("lineups")
    .select("decibel_score")
    .eq("user_id", userId)
    .order("decibel_score", { ascending: false })
    .limit(1)
    .single();
  
  return {
    ...userStats,
    nickname: userData?.nickname,
    topLineup: topLineup || null,
    highest_decibel: highestDecibelData?.decibel_score || 0
  };
};

const performVote = async (prompt) => {
  console.log("🔍 Running performVote for prompt:", prompt);
  const urlParams = new URLSearchParams(window.location.search);
  const voteId = urlParams.get("vote");

  if (!voteId || voteId === "null") {
    console.warn("⚠️ No voteId present in URL, skipping vote.");
    return;
  }

  const alreadyVoted = localStorage.getItem(`bce-voted-${prompt}`);
  if (alreadyVoted) {
    console.log("✅ Already voted for this prompt (localStorage check)");
    return;
  }

  try {
    // Call the new API endpoint instead of direct Supabase update
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        lineupId: voteId, 
        prompt: prompt 
      })
    });

    const result = await response.json();

    if (!response.ok) {
      // Vote was blocked (likely hit IP limit)
      console.error("Vote blocked:", result.error);
      
      if (response.status === 429) {
        // IP rate limit hit
        alert("⚠️ " + result.error);
      } else {
        console.error("Vote failed:", result.error);
      }
      return;
    }

    // Vote succeeded!
    localStorage.setItem(`bce-voted-${prompt}`, "social");
    localStorage.setItem("fromSocialVote", "true");
    localStorage.setItem("socialVoteLineupId", voteId);

    if (typeof window.plausible === "function") {
      window.plausible("Social Vote", {
        props: { lineupId: voteId }
      });
    }

    alert("🔥 Your vote has been counted! Now submit your own.");
    
  } catch (err) {
    console.error("Vote execution error:", err);
    alert("⚠️ There was an error recording your vote. Please try again.");
  }
};

const handleFireVote = async (lineupId, voteType) => {
  // Check localStorage first for UX
  const alreadyVoted = localStorage.getItem(`bce-voted-${dailyPrompt}`);
  if (alreadyVoted) {
    alert("You've already voted today!");
    return;
  }

  try {
    // Call our IP-protected API endpoint
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        lineupId: lineupId, 
        prompt: dailyPrompt 
      })
    });

    const result = await response.json();

    if (!response.ok) {
      // Vote was blocked (likely hit IP limit)
      console.error("Vote blocked:", result.error);
      
      if (response.status === 429) {
        // IP rate limit hit
        alert(result.error);
      } else {
        alert("Oops, there was an issue recording your vote.");
      }
      return;
    }

    // Vote succeeded!
    localStorage.setItem(`bce-voted-${dailyPrompt}`, voteType);
    
    // Track analytics
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible(`${voteType} Vote Clicked`);
      window.plausible("Any Vote Cast");
    }

    alert("🔥 Your vote has been counted!");
    window.location.reload();
    
  } catch (err) {
    console.error("Vote execution error:", err);
    alert("⚠️ There was an error recording your vote. Please try again.");
  }
};

useEffect(() => {
  if (dailyPrompt) {
    performVote(dailyPrompt);

    const fetchRecentLineups = async () => {
      const { data, error } = await supabase
        .from("lineups")
        .select("id, headliner, opener, second_opener, votes, created_at")
        .eq("prompt", dailyPrompt)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error || !data) {
        console.error("Error fetching recent lineups:", error);
        setRecentLineups([]);
        return;
      }

      setRecentLineups(data);
    };

    fetchRecentLineups();
    fetchDeepCutLineup();
  }
}, [dailyPrompt]);

useEffect(() => {
  async function updateYesterdayPrompt() {
    const today = new Date();
    const cutoff = new Date("2025-05-01T00:00:00Z");
    const yesterday = new Date();
    yesterday.setUTCDate(today.getUTCDate() - 1);

    const yyyy = yesterday.getUTCFullYear();
    const mm = String(yesterday.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(yesterday.getUTCDate()).padStart(2, "0");
    const formattedYesterday = `${yyyy}-${mm}-${dd}`;

    if (today >= cutoff) {
      const { data, error } = await supabase
        .from("prompts")
        .select("prompt")
        .eq("prompt_date", formattedYesterday)
        .single();

      if (error || !data) {
        console.error("Failed to fetch yesterday's prompt from database:", error);
      } else {
        setYesterdayPrompt(data.prompt);
      }
    }
  }
  updateYesterdayPrompt();
}, []);

useEffect(() => {
  const fetchPastWinners = async () => {
    const today = new Date();
    const cutoff = new Date("2025-05-01T00:00:00Z");
    if (today < cutoff) return;

    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - 1);
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - 6);

    const { data: promptsData, error: promptError } = await supabase
      .from("prompts")
      .select("prompt, prompt_date")
      .gte("prompt_date", startDate.toISOString().split("T")[0])
      .lte("prompt_date", endDate.toISOString().split("T")[0])
      .order("prompt_date", { ascending: false });

    if (promptError || !promptsData) {
      console.error("Failed to fetch past prompts:", promptError);
      return;
    }

    const results = [];
    for (const p of promptsData) {
      const { data: lineupsData, error: lineupsError } = await supabase
        .from("lineups")
        .select("headliner, opener, second_opener, votes, user_id")
        .eq("prompt", p.prompt);

      if (lineupsError || !lineupsData) continue;

      const countMap = {};
      lineupsData.forEach((l) => {
        const key = `${l.headliner?.name}|||${l.opener?.name}|||${l.second_opener?.name}`;
        const votes = l.votes || 0;
        countMap[key] = (countMap[key] || 0) + 1 + votes;
      });

      const maxCount = Math.max(...Object.values(countMap));
      const top = Object.entries(countMap)
        .filter(([_, count]) => count === maxCount)
        .map(([key]) => {
          const [h, o, s] = key.split("|||");
          return {
            prompt: p.prompt,
            headliner: lineupsData.find(l => l.headliner?.name === h)?.headliner,
            opener: lineupsData.find(l => l.opener?.name === o)?.opener,
            second_opener: lineupsData.find(l => l.second_opener?.name === s)?.second_opener,
          };
        });

      results.push(top[Math.floor(Math.random() * top.length)]);
    }
const filteredResults = results.filter(r => r.prompt !== yesterdayPrompt);
setPastWinners(filteredResults);
  };

  if (yesterdayPrompt) {
    fetchPastWinners();
  }
}, [yesterdayPrompt]);

  const [userStats, setUserStats] = useState(null);
  const [mostVotedLineup, setMostVotedLineup] = useState(null);
  const flyerRef = React.useRef(null);
  const downloadRef = React.useRef(null);
  const [winningPromoter, setWinningPromoter] = useState(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showHowToPlayInfographic, setShowHowToPlayInfographic] = useState(false);
  const [showVotePrompt, setShowVotePrompt] = useState(false);
  const [lastDecibelScore, setLastDecibelScore] = useState(0);
const [lastBonusVotes, setLastBonusVotes] = useState(0);
const [highestDecibel, setHighestDecibel] = useState(null);
const [showEmailSignup, setShowEmailSignup] = useState(false);
const [email, setEmail] = useState("");
const [emailSubmitted, setEmailSubmitted] = useState(false);
const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
const [nickname, setNickname] = useState("");
const [nicknameSaved, setNicknameSaved] = useState(false);
const [showNicknameModal, setShowNicknameModal] = useState(false);

// --- Restore Link Helper ---
const copyRestoreLink = () => {
  try {
    // Ensure user has an ID; if not, create one so they can save it
    if (!localStorage.getItem("bce_user_id")) {
      if (crypto?.randomUUID) {
        localStorage.setItem("bce_user_id", crypto.randomUUID());
      } else {
        // simple fallback UUID
        const f = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
        localStorage.setItem(
          "bce_user_id",
          `${f()}${f()}-${f()}-${f()}-${f()}-${f()}${f()}${f()}`
        );
      }
    }
    const id = localStorage.getItem("bce_user_id");
    const link = `${window.location.origin}/?restore=${id}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link).then(() => {
        alert("✅ Account link copied! Open it on your other device to restore your account.");
        if (typeof window !== "undefined" && window.plausible) {
          window.plausible("Restore Link Copied");
        }
      }).catch(() => {
        const ta = document.createElement("textarea");
        ta.value = link;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("✅ Restore link copied! Open it on your other device to restore your account.");
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = link;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) {
        alert("✅ Restore link copied! Open it on your other device to restore your account.");
      } else {
        alert(`Your restore link:\n${link}\n(Please copy it manually)`);
      }
    }
  } catch (e) {
    console.error("Copy failed:", e);
    alert("Couldn’t copy automatically. We’ll show the link next time.");
  }
};

const handleBadgeClick = () => {
  const rank = userStats?.global_rank;
  if (!rank) return;

  let badgeUrl = "";

  if (rank <= 10) {
    badgeUrl = "/elitepromoter.jpg";
  } else if (rank <= 50) {
    badgeUrl = "/starbooker.jpg";
  } else if (rank <= 100) {
    badgeUrl = "/fanfavorite.jpg";
  } else if (rank <= 250) {
    badgeUrl = "/upandcomer.jpg";
  } else if (rank <= 500) {
    badgeUrl = "/openingact.jpg";
  } else {
    return;
  }

  const newWindow = window.open(badgeUrl, "_blank");
  if (newWindow) newWindow.focus();
};

const handlePromoterClick = async (promoter) => {
  setSelectedPromoter(promoter);
  setShowPromoterModal(true);

  // Track promoter modal open
  const currentUserId = localStorage.getItem("bce_user_id");
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible("Promoter Modal Opened", {
      props: { 
        isOwnProfile: currentUserId === promoter.userId ? "true" : "false"
      }
    });
  }
  
  const details = await fetchPromoterDetails(promoter.userId);
  setPromoterDetails(details);
};

const handleSharePromoterCard = async () => {
  if (!selectedPromoter || !promoterDetails) return;
  
  // Determine which leaderboard to use based on current view
  const isMonthly = showMonthlyLeaderboard;
  const leaderboard = isMonthly ? monthlyTopPromoters : weeklyTopPromoters;
  const timeframe = isMonthly ? "this month" : "this week";
  
  // Find rank in the appropriate leaderboard
  const rank = leaderboard.findIndex(p => p.userId === selectedPromoter.userId) + 1;
  const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
  
  const shareText = `🔥 I'm ${rankEmoji} on Best Concert Ever ${timeframe}!

📊 My Stats:
- ${selectedPromoter.totalPoints} votes ${timeframe}
- Global Rank: ${promoterDetails.global_rank ? `#${promoterDetails.global_rank}` : "Climbing!"}
- ${promoterDetails.total_wins || 0} total wins
- ${promoterDetails.current_streak || 0}-day current streak

Can you beat me?`;

  const shareData = {
    title: "Best Concert Ever - My Promoter Card",
    text: shareText,
    url: "https://bestconcertevergame.com"
  };

  try {
    // Check if Web Share API is available
    if (navigator.share) {
      await navigator.share(shareData);
      // Track the share
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Shared Promoter Card");
      }
    } else {
      // Fallback: Copy to clipboard if share not available
      await navigator.clipboard.writeText(shareText + "\n\nhttps://bestconcertevergame.com");
      alert("✅ Copied to clipboard! Paste it anywhere to share! 🎸");
    }
  } catch (err) {
    // If user cancels or error occurs, try clipboard as fallback
    if (err.name !== "AbortError") {
      try {
        await navigator.clipboard.writeText(shareText + "\n\nhttps://bestconcertevergame.com");
        alert("✅ Copied to clipboard! Paste it anywhere to share! 🎸");
      } catch (clipErr) {
        console.error("Share failed:", err);
      }
    }
  }
};

const handleEmailSignup = async () => {
  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (res.ok) {
      setEmailSubmitted(true);
    } else {
      alert("There was a problem signing up. Try again later.");
    }
  } catch (err) {
    console.error("Email signup error:", err);
  }
};

  const [lineups, setLineups] = useState([]);
  const [deepCutLineup, setDeepCutLineup] = useState(null);
  const [recentLineups, setRecentLineups] = useState([]);
  const [yesterdaysWinner, setYesterdaysWinner] = useState(null);
  const [pastWinners, setPastWinners] = useState([]);
  const [showPastWinners, setShowPastWinners] = useState(false);

 const fetchUserStats = async () => {
  const userId = localStorage.getItem("bce_user_id");
  if (!userId) return;

  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user stats:", error);
    return;
  }

  setUserStats(data);

  // Now check nickname from users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("nickname")
    .eq("user_id", userId)
    .single();

  if (userData?.nickname) {
    setNickname(userData.nickname);
    setNicknameSaved(true);
  }
};

const fetchHighestDecibel = async () => {
  const userId = localStorage.getItem("bce_user_id");
  if (!userId) return;

  const { data, error } = await supabase
    .from("lineups")
    .select("decibel_score")
    .eq("user_id", userId)
    .order("decibel_score", { ascending: false })
    .limit(1)
    .single();

  if (!error && data) {
    setHighestDecibel(data.decibel_score);
  }
};

  useEffect(() => {
    const bounceTimeout = setTimeout(() => {
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible("Engaged 10s+");
      }
    }, 10000);

      if (!localStorage.getItem("howToPlayShown") && !localStorage.getItem("fromSocialVote")) {
    setShowHowToPlayInfographic(true);
    localStorage.setItem("howToPlayShown", "true");
  }

    fetchUserStats();
    fetchHighestDecibel();
    fetchWeeklyTopPromoters().then(promoters => setWeeklyTopPromoters(promoters));
    fetchMonthlyTopPromoters().then(promoters => setMonthlyTopPromoters(promoters));

    const fetchMostVotedLineup = async () => {
      const userId = localStorage.getItem("bce_user_id");
      if (!userId) return;

      const { data, error } = await supabase
        .from("lineups")
        .select("headliner, opener, second_opener, votes")
        .eq("user_id", userId);

      if (error || !data) {
        console.error("Failed to fetch most voted lineup:", error);
        return;
      }

      const sorted = data
        .filter(l => l.votes && l.votes > 0)
        .sort((a, b) => (b.votes || 0) - (a.votes || 0));

      if (sorted.length > 0) {
        setMostVotedLineup(sorted[0]);
      }
    };

    fetchMostVotedLineup();

const normalize = (artist) => {
  if (typeof artist === "string") return artist.trim().toLowerCase();
  if (artist && typeof artist === "object" && artist.name) return artist.name.trim().toLowerCase();
  return "";
};

  return () => clearTimeout(bounceTimeout);
}, []);

useEffect(() => {
  if (!dailyPrompt) return; // wait for the correct prompt

  const fetchTopLineups = async () => {
    const { data, error } = await supabase
      .from("lineups")
      .select("id, headliner, opener, second_opener, votes")
      .eq("prompt", dailyPrompt);

    if (!error && data) {
      const countMap = {};

      data.forEach((lineup) => {
        const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
        const votes = lineup.votes || 0;
        countMap[key] = (countMap[key] || 0) + 1 + votes;
      });

      const allEntries = Object.entries(countMap);

      const voted = allEntries.filter(([_, score]) => score > 1);
      const zeroVoted = allEntries.filter(([_, score]) => score === 1);

      for (let i = zeroVoted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [zeroVoted[i], zeroVoted[j]] = [zeroVoted[j], zeroVoted[i]];
      }

      const combined = [...voted.sort((a, b) => b[1] - a[1]), ...zeroVoted].slice(0, 10);

      const sortedLineups = combined.map(([key]) => {
        const [headlinerName, openerName, secondOpenerName] = key.split("|||");

        const matchingLineup = data.find(
          (entry) =>
            entry.headliner?.name === headlinerName &&
            entry.opener?.name === openerName &&
            entry.second_opener?.name === secondOpenerName
        );

        return matchingLineup ?? {
          headliner: { name: headlinerName },
          opener: { name: openerName },
          second_opener: { name: secondOpenerName }
        };
      });

      setLineups(sortedLineups);
    } else {
      setLineups([]);
    }
  };

  fetchTopLineups();
}, [dailyPrompt]);

useEffect(() => {
  if (!yesterdayPrompt) return; // don't run until it's ready

  const fetchYesterdaysWinner = async () => {
    const { data, error } = await supabase
      .from("lineups")
      .select("headliner, opener, second_opener, votes, user_id")
      .eq("prompt", yesterdayPrompt);

    if (error || !data) return;

    const countMap = {};

    data.forEach((lineup) => {
      const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
      const votes = lineup.votes || 0;
      countMap[key] = (countMap[key] || 0) + 1 + votes;
    });

    const maxCount = Math.max(...Object.values(countMap));
    const topLineups = Object.entries(countMap)
  .filter(([_, count]) => count === maxCount)
  .map(([key]) => {
    const [headliner, opener, second_opener] = key.split("|||");
    const matchingLineup = data.find(
      d =>
        d.headliner?.name === headliner &&
        d.opener?.name === opener &&
        d.second_opener?.name === second_opener
    );
    return {
      headliner: matchingLineup?.headliner,
      opener: matchingLineup?.opener,
      second_opener: matchingLineup?.second_opener,
      user_id: matchingLineup?.user_id
    };
  });

    const winner = topLineups[Math.floor(Math.random() * topLineups.length)];
    setYesterdaysWinner(winner);
    if (winner) {
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("nickname")
    .eq("user_id", winner.user_id)
    .single();

  if (!userError && userData?.nickname) {
    setWinningPromoter(userData.nickname);
  }
}
  };

  fetchYesterdaysWinner();
}, [yesterdayPrompt]); // <-- dependency on yesterdayPrompt 

  const [headliner, setHeadliner] = useState(null);
  const [opener, setOpener] = useState(null);
  const [secondOpener, setSecondOpener] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [ticketReady, setTicketReady] = useState(false);
  const [lineupId, setLineupId] = useState(null);
  const [lineupReady, setLineupReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshRecentLineups = async () => {
  const { data, error } = await supabase
    .from("lineups")
    .select("id, headliner, opener, second_opener, votes, created_at")
    .eq("prompt", dailyPrompt)
    .order("created_at", { ascending: false })
    .limit(6);
  if (!error && data) setRecentLineups(data);
};

const refreshTopLineups = async () => {
  const { data, error } = await supabase
    .from("lineups")
    .select("id, headliner, opener, second_opener, votes")
    .eq("prompt", dailyPrompt);

  if (!error && data) {
    const countMap = {};
    data.forEach((lineup) => {
      const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
      const votes = lineup.votes || 0;
      countMap[key] = (countMap[key] || 0) + 1 + votes;
    });

    const allEntries = Object.entries(countMap);
    const voted = allEntries.filter(([_, score]) => score > 1);
    const zeroVoted = allEntries.filter(([_, score]) => score === 1);
    for (let i = zeroVoted.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [zeroVoted[i], zeroVoted[j]] = [zeroVoted[j], zeroVoted[i]];
    }

    const combined = [...voted.sort((a, b) => b[1] - a[1]), ...zeroVoted].slice(0, 10);

    const sortedLineups = combined.map(([key]) => {
      const [headlinerName, openerName, secondOpenerName] = key.split("|||");
      return data.find(
        (entry) =>
          entry.headliner?.name === headlinerName &&
          entry.opener?.name === openerName &&
          entry.second_opener?.name === secondOpenerName
      ) ?? {
        headliner: { name: headlinerName },
        opener: { name: openerName },
        second_opener: { name: secondOpenerName }
      };
    });

    setLineups(sortedLineups);
  }
};

  const handleSubmit = async () => {
    if ((lockedHeadliner || headliner) && opener && secondOpener) {
      setIsSubmitting(true);
          const enrichArtist = async (artist) => {
      if (!artist.spotifyId) {
        console.warn(`⚠️ No Spotify ID for ${artist.name}, skipping enrichment`);
        return artist;
      }

      try {
        console.log(`🎵 Enriching ${artist.name}...`);
        
        const response = await fetch('/api/enrich-artist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            spotifyId: artist.spotifyId,
            artistName: artist.name 
          })
        });
        
        const enrichedData = await response.json();
        
        if (enrichedData.enriched) {
          console.log(`✅ Enriched ${artist.name}:`, enrichedData);
          return { ...artist, ...enrichedData };
        }
        
        console.warn(`⚠️ Enrichment failed for ${artist.name}`);
        return artist;
        
      } catch (error) {
        console.error(`❌ Error enriching ${artist.name}:`, error);
        return artist;
      }
    };

    console.log('🔄 Enriching all artists with Soundcharts data...');

    const [enrichedHeadliner, enrichedOpener, enrichedSecondOpener] = await Promise.all([
      enrichArtist(lockedHeadliner || headliner),
      enrichArtist(opener),
      enrichArtist(secondOpener)
    ]);

    console.log('✅ All artists enriched!');
    const calculateDecibelLevel = (headliner, opener, secondOpener) => {
  // Normalization functions (each metric contributes 0-25 points)
  const normalizePopularity = (pop) => ((pop || 0) / 100) * 25;
  const normalizeScore = (score) => Math.min(((score || 0) / 100000) * 25, 25);
  const normalizeRadio = (spins) => Math.min(((spins || 0) / 150000) * 25, 25);
  const normalizePlaylists = (count) => Math.min(((count || 0) / 1500000) * 25, 25);

  // Calculate total decibels for one artist (max 100)
  const artistDecibels = (artist) => {
    if (!artist) return 0;
    
    const popPoints = normalizePopularity(artist.popularity);
    const scorePoints = normalizeScore(artist.soundcharts_score);
    const radioPoints = normalizeRadio(artist.radio_spins);
    const playlistPoints = normalizePlaylists(artist.playlist_count);
    
    return popPoints + scorePoints + radioPoints + playlistPoints;
  };

  // Calculate average across all 3 artists
  const headlinerDecibels = artistDecibels(headliner);
  const openerDecibels = artistDecibels(opener);
  const secondOpenerDecibels = artistDecibels(secondOpener);
  
  const averageDecibels = (headlinerDecibels + openerDecibels + secondOpenerDecibels) / 3;
  
  // Round to whole number for clean 0-100 scale
  return Math.round(averageDecibels);
};

// Calculate the Decibel Level for this lineup
const decibelLevel = calculateDecibelLevel(
  enrichedHeadliner, 
  enrichedOpener, 
  enrichedSecondOpener
);

console.log(`🔊 Decibel Level: ${decibelLevel}/100`);
let bonusVotes = 0;
if (decibelLevel >= 90) bonusVotes = 10;      // 90-100: Superstar lineup
else if (decibelLevel >= 80) bonusVotes = 7;  // 80-89: Elite lineup
else if (decibelLevel >= 70) bonusVotes = 5;  // 70-79: Strong lineup
else if (decibelLevel >= 60) bonusVotes = 4;  // 60-69: Good lineup
else if (decibelLevel >= 50) bonusVotes = 3;  // 50-59: Solid lineup
else if (decibelLevel >= 40) bonusVotes = 2;  // 40-49: Decent lineup
else if (decibelLevel >= 30) bonusVotes = 1;  // 30-39: Entry bonus
// Below 30 = no bonus votes

console.log(`🎁 Bonus votes earned: ${bonusVotes}`);
setLastDecibelScore(decibelLevel);
setLastBonusVotes(bonusVotes);
      const normalize = (artist) => {
  if (typeof artist === "object" && artist?.name) return artist.name.trim().toLowerCase();
  return "";
};

const name1 = normalize(enrichedHeadliner);
const name2 = normalize(enrichedOpener);
const name3 = normalize(enrichedSecondOpener);
const uniqueNames = new Set([name1, name2, name3]);

if (uniqueNames.size < 3) {
  alert("You can't use the same artist more than once!");
  return;
}

      if (!localStorage.getItem("bce_user_id")) {
        localStorage.setItem("bce_user_id", crypto.randomUUID());
      }
      const userId = localStorage.getItem("bce_user_id");
  
const { data: existing, error: checkError } = await supabase
  .from("lineups")
  .select("id")
  .eq("user_id", userId)
  .eq("prompt", dailyPrompt);

if (checkError) {
  console.error("Error checking existing submission:", checkError);
  alert("There was an error checking your previous submission.");
  setIsSubmitting(false); 
  return;
}

if (existing.length > 0) {
  alert("You've already submitted a lineup for today's prompt!");
  setIsSubmitting(false); 
  return;
}

// Call the new API endpoint that handles IP checking
const response = await fetch('/api/submit-lineup', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({ 
    prompt: dailyPrompt,
    headliner: enrichedHeadliner,
    opener: enrichedOpener,
    secondOpener: enrichedSecondOpener,
    userId: userId,
    decibelScore: decibelLevel,
    bonusVotes: bonusVotes
  })
});

const result = await response.json();

if (!response.ok) {
  console.error("Submission blocked:", result.error);
  
  if (response.status === 429) {
    // IP rate limit hit
    alert(result.error);
  } else {
    alert("There was an error submitting your lineup.");
  }
  setIsSubmitting(false); 
  return;
}

// Submission succeeded!
setLineupId(result.lineupId);
setLineupReady(true);

      await refreshRecentLineups();
      await refreshTopLineups();
  
      if (typeof window !== 'undefined' && window.plausible) {
  window.plausible("Submit Lineup");
}
setSubmitted(true);
setShowVotePrompt(true);
setTicketReady(true);
localStorage.setItem('ticketReadyToday', 'true');
localStorage.setItem('lineupReadyToday', 'true');
localStorage.setItem('lineupIdToday', result.lineupId);
localStorage.setItem('savedHeadliner', enrichedHeadliner?.name || "");
localStorage.setItem('savedSecondOpener', enrichedSecondOpener?.name || "");
localStorage.setItem('savedOpener', enrichedOpener?.name || "");
console.log("Lineup submitted:", { headliner, opener, secondOpener });
setIsSubmitting(false);   
    }
  };  

  const getBadgeSrc = (type) => {
    if (!userStats) return "/streaker-locked.png";
  
    if (type === "streaker") {
      const val = userStats.longest_streak ?? 0;
      if (val >= 150) return "/streaker-150.png";
      if (val >= 125) return "/streaker-125.png";
      if (val >= 100) return "/streaker-gold.png";
      if (val >= 50) return "/streaker-silver.png";
      if (val >= 25) return "/streaker-bronze.png";
      return "/streaker-locked.png";
    }
  
    if (type === "hitmaker") {
      const val = userStats.total_wins ?? 0;
      if (val >= 100) return "/charttopper-100.png";
      if (val >= 75) return "/charttopper-75.png";
      if (val >= 50) return "/charttopper-gold.png";
      if (val >= 20) return "/charttopper-silver.png";
      if (val >= 5) return "/charttopper-bronze.png";
      return "/streaker-locked.png";
    }
  
    if (type === "charttopper") {
      const val = userStats.total_top_10s ?? 0;
      if (val >= 100) return "/hitmaker-100.png";
      if (val >= 75) return "/hitmaker-75.png";
      if (val >= 50) return "/hitmaker-gold.png";
      if (val >= 25) return "/hitmaker-silver.png";
      if (val >= 10) return "/hitmaker-bronze.png";
      return "/streaker-locked.png";
    }
  
    return `/public/${type}-locked.png`;
  };  

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-10 px-4 bg-gradient-to-b from-[#0f0f0f] to-[#1e1e1e] text-white font-sans">

{/* Market Indicator */}
    <div className="fixed top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-xs text-yellow-400 border border-yellow-400/30 backdrop-blur-sm z-50">
  🌍 {userMarket === 'MX' ? 'México' : userMarket === 'US' ? 'USA' : 'Global'}
</div>

{showHowToPlay && (
        <div className="fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#fdf6e3] text-black p-6 rounded-2xl w-[90%] max-w-xl text-left relative shadow-2xl border-[6px] border-black border-double">
            <button
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-black"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">HOW TO PLAY</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Time to flex those Music Promoter skills and show everyone you know how to assemble the ULTIMATE CONCERT LINE-UP!</li>
              <li>CHECK THE DAILY PROMPT for the genre of the show you&apos;re promoting.</li>
              <li>Use the drop-down menus to select THREE ARTISTS who fit the bill.</li>
              <li>CHOOSE THE ORDER of your show - the OPENER, 2ND OPENER and HEADLINER.</li>
              <li>Once you have made your selections, hit <b>SUBMIT LINEUP</b>. Click SHARE YOUR LINEUP to announce your show and get votes.</li>
              <li>All lineups benefit from a <b>DECIBEL LEVEL</b> boost, granting bonus votes based on artists daily industry buzz.</li>
              <li>Today&apos;s TOP 10 will be posted daily. <b>VOTE</b> for your favorite lineup from the Top 10 or Recent Drops by clicking the FIRE 🔥 EMOJI. Sometimes a player&apos;s DEEP CUT may appear as well.</li>
              <li>Lineups with the MOST VOTES will win the day. Win points, unlock badges and promoter awards. Bragging rights, baby!</li>
              <li>NEW GAMES and YESTERDAY&apos;S WINNERS are posted every single day at 5pm PST.</li>
            </ul>
            <div className="text-center mt-6">
              <button
                onClick={() => setShowHowToPlay(false)}
                className="inline-block bg-black text-white text-lg px-6 py-2 rounded-full border-2 border-black shadow-md hover:bg-yellow-300 hover:text-black"
              >
                Let&apos;s Play!
              </button>
            </div>
          </div>
        </div>
      )}

{showHowToPlayInfographic && (
  <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 backdrop-blur-sm">
    <div className="relative max-w-[90%] w-[420px] rounded-2xl shadow-2xl border-4 border-white overflow-hidden">
      <img
        src="/howtoplayinfographic.png"
        alt="How to Play"
        className="w-full h-auto object-contain"
      />
      <button
        onClick={() => setShowHowToPlayInfographic(false)}
        className="absolute top-2 right-2 bg-black text-white text-xl font-bold rounded-full px-3 py-1 hover:bg-red-600 transition"
      >
        &times;
      </button>
    </div>
  </div>
)}

{showVotePrompt && (
  <div className="fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
    <div className="bg-[#fdf6e3] text-black p-6 rounded-2xl w-[90%] max-w-sm text-center relative shadow-2xl border-[6px] border-black border-double">
      <button
        onClick={() => setShowVotePrompt(false)}
        className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-black"
      >
        &times;
      </button>
<h2 className="text-2xl font-bold mb-4">🎉 Lineup Submitted!</h2>

{/* Decibel Score Display */}
<div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-4 mb-4 shadow-md">
  <div className="flex items-center justify-center gap-3 mb-2">
    <span className="text-4xl">🔊</span>
    <div className="text-left">
      <div className="text-3xl font-black text-yellow-600">
        {lastDecibelScore}
        <span className="text-lg text-gray-500">/100</span>
      </div>
      <div className="text-xs text-gray-600 uppercase tracking-wide font-bold">
        Decibel Level
      </div>
    </div>
  </div>
  
  {lastBonusVotes > 0 && (
    <div className="mt-3 pt-3 border-t-2 border-yellow-300">
      <p className="text-sm font-bold text-green-700">
        🎁 +{lastBonusVotes} Bonus Votes Earned!
      </p>
      <p className="text-xs text-gray-700 mt-1 font-semibold">
        {lastDecibelScore >= 90 ? "🌟 Superstar lineup!" :
         lastDecibelScore >= 80 ? "💎 Elite lineup!" :
         lastDecibelScore >= 70 ? "💪 Strong lineup!" :
         lastDecibelScore >= 60 ? "👍 Good lineup!" :
         lastDecibelScore >= 50 ? "✨ Solid lineup!" :
         lastDecibelScore >= 40 ? "👌 Decent lineup!" :
         "🎵 Nice work!"}
      </p>
    </div>
  )}
  
  {lastBonusVotes === 0 && (
    <p className="text-xs text-gray-600 mt-2 italic">
      Pick artists with more buzz next time for bonus votes!
    </p>
  )}
</div>

<p className="text-sm mb-6 font-semibold">Now complete today&apos;s game by voting for your favorite lineup by clicking on the 🔥!</p>
      <button
        onClick={() => {
          setShowVotePrompt(false);
          const top10Section = document.getElementById("top-10-section");
          if (top10Section) {
            top10Section.scrollIntoView({ behavior: "smooth" });
          }
        }}
        className="bg-black text-yellow-300 font-bold py-2 px-6 rounded-full hover:bg-yellow-300 hover:text-black transition uppercase text-sm"
      >
        Browse Top 10 & Vote 🔥
      </button>
    </div>
  </div>
)}

    <div className="flex flex-col items-center justify-start min-h-screen py-10 px-4 bg-gradient-to-b from-[#0f0f0f] to-[#1e1e1e] text-white font-sans">
      <div 
  ref={flyerRef} 
  className="relative bg-[#fdf6e3] text-black rounded-xl p-6 w-full max-w-md text-center border-2 border-yellow-400 shadow-[0_0_15px_4px_rgba(253,224,71,0.8)] bg-[url('/bcefans.jpg')] bg-cover bg-center"
>
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-white rounded-full border-4 border-black shadow-lg flex items-center justify-center overflow-hidden">
          <img src="/yellow-top-badge.png" alt="Best Concert Ever Logo" className="w-full h-full object-cover" style={{ objectFit: "cover", objectPosition: "center" }} crossOrigin="anonymous" />
        </div>

        <div className="mt-16 mb-4 text-base font-extrabold uppercase tracking-widest text-black inline-block px-4 py-1 border-2 border-black rotate-[-2deg] bg-white shadow-md font-mono">
          {dailyPrompt}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <ArtistSearch label="Opener" onSelect={setOpener} disabled={submitted} />
          <ArtistSearch label="2nd Opener" onSelect={setSecondOpener} disabled={submitted} />
        </div>

        <ArtistSearch
  label="Headliner"
  onSelect={setHeadliner}
  disabled={submitted || lockedHeadliner !== null}
  locked={lockedHeadliner !== null}
/>

        <div className="mt-8 grid grid-cols-2 gap-4 items-start justify-center">
          <LineupSlot artist={opener} label="Opener" />
          <LineupSlot artist={secondOpener} label="2nd Opener" />
        </div>

        <div className="mt-4">
          <LineupSlot artist={headliner} label="Headliner" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
  onClick={handleSubmit}
  disabled={submitted || isSubmitting || !(headliner && opener && secondOpener)}
  className={`px-6 py-2 rounded-full font-bold uppercase tracking-wide transition shadow ${
    submitted || isSubmitting || !(headliner && opener && secondOpener)
      ? "bg-gray-400 cursor-not-allowed text-white"
      : "bg-[#fdc800] text-black hover:brightness-110 hover:ring-4 hover:ring-[#fdc800]/60 hover:shadow-[0_0_12px_#fdc800] active:scale-95"
  }`}
>
  {isSubmitting ? (
    <span className="flex items-center gap-2">
      <span className="animate-speaker-pulse">🔊</span>
      Calculating Decibel Level...
    </span>
  ) : (
    "Submit Lineup"
  )}
</button>
          <button
  onClick={async () => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible("Download Lineup");
    }    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    const background = new Image();
    background.src = "/bestconcertdownloadimage.png";
    background.crossOrigin = "anonymous";
  
    background.onload = async () => {
      const WIDTH = background.width;
      const HEIGHT = background.height;
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
  
      ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
  
      const loadImage = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = src;
          img.onload = () => resolve(img);
        });
  
      try {
        const [headlinerImg, openerImg, secondOpenerImg] = await Promise.all([
          loadImage(headliner?.image),
          loadImage(opener?.image),
          loadImage(secondOpener?.image),
        ]);
  
ctx.drawImage(headlinerImg, WIDTH / 2 - 125, HEIGHT - 660, 250, 250);
ctx.drawImage(openerImg, WIDTH / 2 - 250, HEIGHT - 380, 200, 200);
ctx.drawImage(secondOpenerImg, WIDTH / 2 + 50, HEIGHT - 380, 200, 200);

ctx.font = "bold 24px Arial";
ctx.fillStyle = "#ffffff";
ctx.textAlign = "center";

ctx.fillText(headliner?.name || "", WIDTH / 2, HEIGHT - 440 + 40);
ctx.fillText(opener?.name || "", WIDTH / 2 - 140, HEIGHT - 160);
ctx.fillText(secondOpener?.name || "", WIDTH / 2 + 140, HEIGHT - 160);

  
        const link = document.createElement("a");
        link.download = "best-concert-ever.jpg";
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click();
      } catch (err) {
        console.error("Image download failed:", err);
      }
    };
  }}
                 
            disabled={!submitted}
            className={`px-6 py-2 rounded-full font-bold uppercase tracking-wide border transition ${
              submitted
                ? "border-black bg-white text-black hover:bg-yellow-100"
                : "text-gray-400 border-gray-500 cursor-not-allowed"
            }`}
          >
            Download Lineup
          </button>
        </div>
      </div>
      
      <div
  className="mt-4 text-sm text-gray-300 underline cursor-pointer hover:text-white"
  onClick={() => {
    setShowHowToPlay(true);
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible("How to Play Clicked");
    }
  }}
>
  How to Play
</div>
<div className="mb-8 text-sm text-gray-300 underline cursor-pointer hover:text-white" onClick={() => setShowEmailSignup(true)}>
  Sign Up for Daily Puzzles & Winners
</div>

{ticketReady && lineupReady && (
  <div className="flex flex-col items-center my-10 animate-fade-in">
    <button
      onClick={async () => {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible("Share Ticket");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const background = new Image();
  background.src = "/BCEticketstub.png";
  background.crossOrigin = "anonymous";

  background.onload = async () => {
    canvas.width = background.width;
    canvas.height = background.height;
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const font = new FontFace("DataErrorHoriz", "url(/DataErrorHoriz.woff)");
    await font.load();
    document.fonts.add(font);

    ctx.fillStyle = "black";
    ctx.font = '44px "DataErrorHoriz"';
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const promptText = (dailyPrompt || "").toUpperCase();
    const headlinerText = (localStorage.getItem("savedHeadliner") || "").toUpperCase();
    const secondOpenerText = (localStorage.getItem("savedSecondOpener") || "").toUpperCase();
    const openerText = (localStorage.getItem("savedOpener") || "").toUpperCase();
    const today = new Date();
    const formattedDate = String(today.getMonth() + 1).padStart(2, "0") + String(today.getDate()).padStart(2, "0") + today.getFullYear();
    const trimmedPrompt = promptText.replace(/\s+/g, "").substring(0, 7);
    const barcodeCodeText = `${formattedDate}-${trimmedPrompt}`;

    ctx.fillText(promptText, 245, 268);
    ctx.fillText(headlinerText, 360, 359);
    ctx.fillText(secondOpenerText, 390, 451);
    ctx.fillText(openerText, 252, 542);
    ctx.fillText(barcodeCodeText, 148, 643);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], "bce-ticket.jpg", { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          const storedLineupId = lineupId || localStorage.getItem('lineupIdToday');
          const voteUrl = `https://bestconcertevergame.com?vote=${storedLineupId}`;

const tinyUrl = voteUrl;

const shareText = `Here’s my lineup for “${dailyPrompt}” 🎶🔥 Vote for it: ${tinyUrl} or submit your own! #bestconcertever`;

await navigator.share({
  title: "Best Concert Ever",
  text: shareText,
  files: [file],
});
        } catch (err) {
          console.error("Share failed:", err);
          alert("Sharing was cancelled or failed.");
        }
      } else {
        const link = document.createElement("a");
        link.download = "bce-ticket.jpg";
        link.href = URL.createObjectURL(blob);
        link.click();
      }
    }, "image/jpeg");
  };
      }}              
      
      className="flex items-center space-x-2 bg-black text-cyan-400 font-bold px-6 py-3 rounded-full border-2 border-cyan-400 hover:text-white hover:border-white hover:shadow-lg transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.7)] uppercase tracking-widest"
>
  <span>🎟️ Share Lineup / Get Votes</span>
</button>
  </div>
)}

{lockedHeadliner && (
  <div className="mb-4">
    <img
      src="/locked-and-loaded.png"
      alt="Locked & Loaded"
      className="mx-auto w-48 h-auto sparkle-effect"
    />
  </div>
)}

      <div id="top-10-section" className="mt-0 flex justify-center items-center w-full">
        <div className="relative w-full max-w-md text-center">
          <div className="absolute inset-0 rounded-xl border-2 border-yellow-400 animate-pulse pointer-events-none"></div>
          <div className="relative bg-black rounded-xl p-6 border-2 border-yellow-400">
            <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 text-yellow-400 drop-shadow-[0_0_12px_yellow]">
              Today&apos;s Top 10
            </h2>
            <ul className="flex flex-col gap-4 items-center">
  {lineups.map((lineup, idx) => {
    const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
    const hasVoted = localStorage.getItem(`bce-voted-${dailyPrompt}`);

    return (
      <li key={idx} className="text-white text-center">
        <div>
        {lineup.opener?.name} / {lineup.second_opener?.name} / {lineup.headliner?.name}
        </div>
        {!hasVoted && (
  <button
    onClick={() => {
      if (!lineup.id) {
        alert("Oops, could not find lineup to vote for.");
        return;
      }
      handleFireVote(lineup.id, "Top 10");
    }}
    className="mt-1 text-xl hover:scale-110 transition-transform"
    title="Vote for this lineup"
  >
    🔥
  </button>
)}
      </li>
    );
  })}
</ul>

{deepCutLineup && (
  <div className="mt-6 text-center border-t border-yellow-400 pt-4">
    <div className="text-yellow-400 font-bold mb-1 text-md">🎧 Deep Cut of the Day</div>
    <div className="text-white text-sm">
      {deepCutLineup.opener?.name} / {deepCutLineup.second_opener?.name} / {deepCutLineup.headliner?.name}
    </div>

    {!localStorage.getItem(`bce-voted-${dailyPrompt}`) && (
  <button
    onClick={() => {
      if (!deepCutLineup.id) {
        alert("Oops, could not find Deep Cut lineup to vote for.");
        return;
      }
      handleFireVote(deepCutLineup.id, "Deep Cut");
    }}
    className="mt-1 text-xl hover:scale-110 transition-transform"
    title="Vote for this Deep Cut lineup"
  >
    🔥
  </button>
)}
  </div>
)}
          </div>
        </div>
      </div>

      {lineups.length === 10 && recentLineups.length === 6 && (
  <div className="mt-12 flex justify-center items-center w-full">
    <div className="relative w-full max-w-md text-center">
      <div className="absolute inset-0 rounded-xl border-2 border-blue-400 animate-pulse pointer-events-none"></div>
      <div className="relative bg-black rounded-xl p-6 border-2 border-blue-400">
      <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 text-blue-400 drop-shadow-[0_0_12px_#60A5FA]">
  Recent Drops
</h2>
        <ul className="flex flex-col gap-4 items-center">
          {recentLineups.map((lineup, idx) => {
            const hasVoted = localStorage.getItem(`bce-voted-${dailyPrompt}`);
            return (
              <li key={idx} className="text-white text-center">
                <div>
                  {lineup.opener?.name} / {lineup.second_opener?.name} / {lineup.headliner?.name}
                </div>
                {!hasVoted && (
  <button
    onClick={() => {
      if (!lineup.id) {
        alert("Oops, could not find lineup to vote for.");
        return;
      }
      handleFireVote(lineup.id, "Recent Drop");
    }}
    className="mt-1 text-xl hover:scale-110 transition-transform"
    title="Vote for this Recent Drop lineup"
  >
    🔥
  </button>
)}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  </div>
)}

      {yesterdaysWinner && (
        <div className="mt-12 flex justify-center items-center w-full">
          <div className="relative w-full max-w-md text-center">
          <div className="absolute inset-0 -z-10 rounded-xl border-2 border-red-400 animate-pulse"></div>

            <div className="relative bg-black rounded-xl p-6 border-2 border-red-400">
              <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 text-red-400 drop-shadow-[0_0_12px_red]">
                Yesterday&apos;s Winning Lineup
              </h2>
              <div className="mb-6 text-base font-extrabold uppercase tracking-widest text-red-400 inline-block px-4 py-1 border-2 border-red-400 rotate-[-2deg] bg-black shadow-md font-mono">
                {yesterdayPrompt}
              </div>
              <ul className="flex flex-col gap-4 items-center">
                {[yesterdaysWinner.headliner, yesterdaysWinner.second_opener, yesterdaysWinner.opener].map((artist, idx) => (
                  <li key={idx} className="text-white flex flex-col items-center">
                    <div className="group">
                      <a href={artist?.url} target="_blank" rel="noopener noreferrer">
                      <img
  src={artist?.image}
  alt={artist?.name}
  className={`rounded-full mb-2 object-cover border-2 group-hover:scale-105 transition-transform duration-200 ${
    idx === 0
      ? 'w-32 h-32 border-yellow-300 shadow-[0_0_15px_4px_rgba(253,224,71,0.8)]'
      : 'w-24 h-24 border-red-400 shadow-[0_0_8px_#f87171]'
  }`}
/>

                      </a>
                    </div>
                    <span className={`font-bold ${idx === 0 ? 'text-lg' : ''}`}>{artist?.name}</span>
                  </li>
                ))}
{winningPromoter && (
  <div className="mt-2">
    <span className="inline-block bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-md">
  WINNING PROMOTER: {winningPromoter}
</span>
  </div>
)}
              </ul>
              <hr className="mt-6 mb-4 border-t border-red-400 opacity-40" />
              {pastWinners.length > 0 && (
  <div className="mt-6">
    <button
  onClick={() => setShowPastWinners(!showPastWinners)}
  className="text-sm text-red-300 underline hover:text-white mb-3"
>
  {showPastWinners ? "▲ Hide Last Week's Winners" : "▼ Last Week's Winners"}
</button>

    <div
  className={`transition-all duration-500 ease-in-out overflow-hidden ${
    showPastWinners ? "max-h-[2000px] opacity-100 pt-2 mt-4" : "max-h-0 opacity-0"
  } grid gap-4`}
>
      {pastWinners.map((winner, idx) => (
        <div key={idx} className="flex flex-col items-center justify-center mb-6">
          <div className="text-sm font-extrabold uppercase tracking-widest text-red-400 inline-block px-4 py-1 border-2 border-red-400 rotate-[-2deg] bg-black shadow-md font-mono mb-2">
            {winner.prompt}
          </div>
          <div className="flex justify-between items-start gap-4 w-full">
            {[winner.opener, winner.second_opener, winner.headliner].map((artist, i) => (
  <div key={i} className="flex flex-col items-center w-1/3">
    <a href={artist?.url} target="_blank" rel="noopener noreferrer">
      <img
        src={artist?.image || "/placeholder.jpg"}
        alt={artist?.name || "Artist"}
        className="w-16 h-16 rounded-md object-cover border border-red-400 mb-1 hover:scale-105 transition-transform"
      />
    </a>
    <span className="text-xs text-white font-bold text-center break-words leading-tight">
      {artist?.name || "Artist"}
    </span>
  </div>
))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
            </div>
          </div>
        </div>
      )}

<div ref={downloadRef} className="absolute left-[-9999px]">
  <div className="relative w-[768px] h-[1365px]">
    <img
      src="/bestconcertdownloadimage.png"
      alt="Poster Background"
      className="w-full h-full object-cover"
      crossOrigin="anonymous"
    />

   {/* Prompt Styled Like Yesterday's Winning Lineup */}
{dailyPrompt && (
  <div className="absolute top-[140px] left-1/2 transform -translate-x-1/2 rotate-[-2deg]">
    <div className="text-center text-red-500 text-lg font-bold uppercase border-2 border-red-500 px-6 py-2 tracking-wider whitespace-nowrap bg-black">
      {dailyPrompt}
    </div>
  </div>
)}

    <div className="absolute bottom-24 w-full flex flex-col items-center gap-6 px-4">
      <div className="w-40 h-40 rounded-2xl border border-red-600 overflow-hidden shadow-xl">
        {headliner?.image && (
          <img
            src={headliner.image}
            alt={headliner.name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        )}
      </div>

      <div className="flex gap-4">
        {[opener, secondOpener].map((artist, idx) => (
          <div key={idx} className="w-32 h-32 rounded-2xl border border-red-600 overflow-hidden shadow-md">
            {artist?.image && (
              <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
{showEmailSignup && (
  <div className="fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
    <div className="bg-[#fdf6e3] text-black p-6 rounded-2xl w-[90%] max-w-sm text-left relative shadow-2xl border-[6px] border-black border-double">
      <button
        onClick={() => setShowEmailSignup(false)}
        className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-black"
      >
        &times;
      </button>
      <h2 className="text-2xl font-bold mb-4">Get Daily Prompts & Winners</h2>
      {emailSubmitted ? (
        <p className="text-green-600 font-semibold">Thanks for subscribing! 🎉</p>
      ) : (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-black rounded-md mb-4"
          />
          <button
            onClick={handleEmailSignup}
            className="w-full bg-black text-yellow-300 py-2 rounded-full font-bold hover:bg-yellow-300 hover:text-black transition"
          >
            Subscribe
          </button>
          <p className="mt-3 text-[12px] leading-snug text-gray-600 text-center">
  By signing up, you agree to our{" "}
  <button
    type="button"
    onClick={() => setShowPrivacyPolicy(true)}
    className="underline hover:text-black"
  >
    Privacy Policy
  </button>.
</p>
        </>
      )}
    </div>
  </div>
)}

{showPrivacyPolicy && (
  <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm">
    <div className="bg-[#fdf6e3] text-black p-6 rounded-2xl w-[90%] max-w-md text-left relative shadow-2xl border-[6px] border-black border-double overflow-y-auto max-h-[90vh]">
      <button
        onClick={() => setShowPrivacyPolicy(false)}
        className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-black"
        aria-label="Close privacy policy"
      >
        &times;
      </button>

      <h2 className="text-2xl font-bold mb-3">Privacy Policy</h2>

      <p className="text-sm mb-3">
        We only collect your email to send you the daily prompt and winners. We don’t sell or rent your data.
      </p>
      <p className="text-sm mb-3">
        You can unsubscribe anytime via the link in our emails.
      </p>
      <p className="text-sm">
        Questions? <a href="mailto:support@bestconcertevergame.com" className="underline">support@bestconcertevergame.com</a>
      </p>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={() => setShowPrivacyPolicy(false)}
          className="inline-block bg-black text-yellow-300 px-5 py-2 rounded-full font-bold hover:bg-yellow-300 hover:text-black transition"
        >
          Back to Sign Up
        </button>
      </div>
    </div>
  </div>
)}

{showNicknameModal && (
  <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm">
    <div className="bg-[#fdf6e3] text-black p-6 rounded-2xl w-[90%] max-w-sm text-left relative shadow-2xl border-[6px] border-black border-double">
      <button
        onClick={() => setShowNicknameModal(false)}
        className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-black"
      >
        &times;
      </button>
      <h2 className="text-xl font-bold mb-4">Enter Your Promoter Nickname</h2>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value.toUpperCase())}
        maxLength={24}
        className="w-full px-4 py-2 border border-black rounded-md mb-4 uppercase"
        placeholder="ALL CAPS SCREENNAME"
      />
      <button
        onClick={async () => {
          const userId = localStorage.getItem("bce_user_id");
          if (!userId || !nickname.trim()) return;

          // Ensure user row exists
          await supabase
            .from("users")
            .upsert([{ user_id: userId }], { onConflict: "user_id" });

          const trimmedNickname = nickname.trim();

// Check if nickname already exists
const { data: existing, error: checkError } = await supabase
  .from("users")
  .select("user_id")
  .eq("nickname", trimmedNickname)
  .neq("user_id", userId); // exclude current user in case they're retrying

if (existing && existing.length > 0) {
  alert("That nickname is already taken. Please choose another.");
  return;
}

// Ensure row exists
await supabase
  .from("users")
  .upsert([{ user_id: userId }], { onConflict: "user_id" });

const { error } = await supabase
  .from("users")
  .update({ nickname: trimmedNickname })
  .eq("user_id", userId);

if (!error) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible("Nickname Chosen");
  }
  setNicknameSaved(true);
  setShowNicknameModal(false);
} else {
  alert("Something went wrong saving your nickname.");
}
        }}
        className="bg-black text-white px-4 py-2 rounded-full font-bold hover:bg-yellow-300 hover:text-black transition"
      >
        Save Nickname
      </button>
    </div>
  </div>
)}

{/* WEEKLY/MONTHLY TOP PROMOTERS SECTION */}
      {(weeklyTopPromoters.length > 0 || monthlyTopPromoters.length > 0) && (
        <div className="mt-12 flex justify-center items-center w-full">
          <div className="relative w-full max-w-md text-center">
            <div className="absolute inset-0 -z-10 rounded-xl border-2 border-yellow-400 animate-pulse"></div>
            <div className="relative bg-black rounded-xl p-6 border-2 border-yellow-400">
              <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 text-yellow-400 drop-shadow-[0_0_12px_yellow]">
                🔥 Top Promoters
              </h2>
              
              {/* Toggle Tabs */}
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => {
                    setShowMonthlyLeaderboard(false);
                    if (typeof window !== "undefined" && window.plausible) {
                      window.plausible("Leaderboard Toggle", {
                        props: { view: "weekly" }
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                    !showMonthlyLeaderboard
                      ? "bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                      : "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => {
                    setShowMonthlyLeaderboard(true);
                    if (typeof window !== "undefined" && window.plausible) {
                      window.plausible("Leaderboard Toggle", {
                        props: { view: "monthly" }
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                    showMonthlyLeaderboard
                      ? "bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                      : "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                  }`}
                >
                  Monthly
                </button>
              </div>
              
              <p className="text-xs text-yellow-300 mb-4 italic">
                {showMonthlyLeaderboard 
                  ? "Top 10 Promoters by Votes (Last 30 Days)"
                  : "Top 10 Promoters by Votes (Last 7 Days)"}
              </p>
              
              <ol className="flex flex-col gap-2 text-white">
                {(showMonthlyLeaderboard ? monthlyTopPromoters : weeklyTopPromoters).map((promoter, index) => (
                  <li 
                    key={promoter.userId}
                    onClick={() => handlePromoterClick(promoter)}
                    className={`flex justify-between items-center text-sm px-3 py-2 rounded-lg cursor-pointer transition-all hover:scale-102 ${
                      index === 0 
                        ? "bg-yellow-500/20 border border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)] hover:bg-yellow-500/30"
                        : index <= 2
                        ? "bg-yellow-500/10 hover:bg-yellow-500/20"
                        : "bg-gray-800/50 hover:bg-gray-700/50"
                    }`}
                  >
                    <span className="font-bold">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                    </span>
                    <span className="flex-1 text-center font-semibold">
                      {promoter.nickname}
                    </span>
                    <span className="text-yellow-400 font-bold">
                      {promoter.totalPoints} votes
                    </span>
                  </li>
                ))}
              </ol>
              
              <p className="mt-4 text-[10px] text-yellow-300">
                {showMonthlyLeaderboard 
                  ? "Rolling 30-day leaderboard • Set your nickname to compete"
                  : "Rolling 7-day leaderboard • Set your nickname to compete"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* YOUR GREATEST HITS SECTION */}
      <div className="mt-12 flex justify-center items-center w-full">
        <div className="relative w-full max-w-md text-center">
          <div className="absolute inset-0 -z-10 rounded-xl border-2 border-green-400 animate-pulse"></div>
          <div className="relative bg-black rounded-xl p-6 border-2 border-green-400">
            <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 text-green-400 drop-shadow-[0_0_12px_green]">
              Your Greatest Hits
            </h2>
            {nicknameSaved && (
  <div className="text-green-400 italic text-xs uppercase mb-2 tracking-wide">
    {nickname}
  </div>
)}

{userStats?.total_lineups_submitted >= 1 && !nicknameSaved && (
  <div className="mb-4">
    <button
      onClick={() => setShowNicknameModal(true)}
      className="bg-green-500 text-black font-bold px-4 py-1 rounded-full text-xs tracking-wide border border-green-300 hover:bg-green-300 transition"
    >
      Choose Promoter Nickname
    </button>
  </div>
)}
            <ul className="flex flex-col gap-4 items-center text-white">
  <li className="text-sm">🎤 Promoted Lineups (So Far): <span className="font-bold">{userStats?.total_lineups_submitted ?? "--"}</span></li>
  <li className="text-sm">🏆 All-Time Top 10 Hits: <span className="font-bold">{userStats?.total_top_10s ?? "--"}</span></li>
  <li className="text-sm">🥇 Winning Lineups: <span className="font-bold">{userStats?.total_wins ?? "--"}</span></li>
  <li className="text-sm">🔊 Highest dB Level: <span className="font-bold">{highestDecibel ?? "--"}</span></li>
  <li className="text-sm">🔥 Current Streak: <span className="font-bold">{userStats?.current_streak ?? "--"}</span></li>
  <li className="text-sm">📆 Longest Daily Streak: <span className="font-bold">{userStats?.longest_streak ?? "--"}</span></li>
  <li className="text-sm">🌍 Global Rank: <span className="font-bold">
    {userStats?.global_rank ? `#${userStats.global_rank}` : "Not Ranked Yet"}
  </span></li>

  {typeof userStats?.global_rank === "number" && (
  <li>
    <span
      onClick={handleBadgeClick}
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-md cursor-pointer hover:scale-105 transition-transform
        ${userStats.global_rank <= 10
          ? "bg-yellow-300 text-black animate-pulse"
          : "bg-green-900 text-green-300"}
      `}
      title="Click to download your badge!"
    >
      {userStats.global_rank <= 10
        ? "🏆 Elite Promoter"
        : userStats.global_rank <= 50
        ? "🌟 Star Booker"
        : userStats.global_rank <= 100
        ? "🔥 Fan Favorite"
        : userStats.global_rank <= 250
        ? "🎶 Up-And-Comer"
        : userStats.global_rank <= 500
        ? "🎤 Opening Act"
        : null}
    </span>
  </li>
)}

</ul>
{/* Awards Row */}
<div className="flex justify-center gap-4 mt-6 mb-2">
  {["streaker", "hitmaker", "charttopper"].map((type) => {
  const val =
    type === "streaker"
      ? userStats?.longest_streak ?? 0
      : type === "hitmaker"
      ? userStats?.total_wins ?? 0
      : userStats?.total_top_10s ?? 0;

  const milestones = {
    streaker: [25, 50, 100, 125, 150],
    hitmaker: [5, 20, 50, 75, 100],
    charttopper: [10, 25, 50, 75, 100],
  };

  const levels = milestones[type];
  const nextLevel = levels.find((m) => val < m) || levels[levels.length - 1];
  const progressPercent = Math.min((val / nextLevel) * 100, 100);

  const badgeSrc = getBadgeSrc(type);
  const isGold = badgeSrc.includes("gold");

  return (
    <div key={type} className="flex flex-col items-center group w-24">
      <img
  src={badgeSrc}
  alt={`${type} badge`}
  className={`w-20 h-20 mx-auto rounded-md object-contain ${
    isGold ? "shadow-[0_0_12px_rgba(255,215,0,0.6)]" : ""
  }`}
/>
<div className="mt-2 text-xs text-white text-center opacity-80 group-hover:opacity-100 transition">
  {type === "streaker"
    ? "Streaker"
    : type === "hitmaker"
    ? "Hit Maker"
    : "Chart Topper"}
</div>
<div className="w-full h-1 mt-2 bg-gray-800 rounded-full overflow-hidden">
  <div
    className="h-full transition-all duration-500"
    style={{
      width: `${progressPercent}%`,
      background: `linear-gradient(to right, #ef4444 0%, #facc15 50%, #39FF14 100%)`,
      backgroundSize: `${100 / (progressPercent / 100)}% 100%`,
      backgroundRepeat: "no-repeat"
    }}
  ></div>
</div>
    </div>
  );
})}
</div>

            <div className="mt-6">
  <h3 className="text-green-300 font-bold mb-2 text-lg">🔥 Most Voted Lineup</h3>
  {mostVotedLineup ? (
    <>
      <div className="flex justify-center gap-4">
        {[mostVotedLineup.opener, mostVotedLineup.second_opener, mostVotedLineup.headliner].map((artist, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <img
              src={artist?.image || "/placeholder.jpg"}
              alt={artist?.name || "Artist"}
              className="w-20 h-20 rounded-md object-cover border border-green-400 mb-1"
            />
            <span className="text-xs font-bold text-center max-w-[5.5rem] break-words leading-tight min-h-[2.5rem]">
  {artist?.name || "Artist"}
</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-green-400">🔥 <span className="font-bold">{mostVotedLineup.votes ?? 0}</span> votes</p>
    </>
  ) : (
    <p className="text-sm text-green-400">No votes yet.</p>
  )}
  <p className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[10px] text-green-300">
  Stats updated daily at 6:30 PM PST</p>
</div>
      </div>
      </div>
    </div>
{/* Restore link helper: under Greatest Hits, above Spotify */}
<div className="mt-4 text-center">
  <button
    onClick={copyRestoreLink}
    className="px-3 py-1.5 rounded-full font-semibold text-xs bg-green-500 text-black shadow-md hover:bg-green-400 hover:scale-105 transition-transform"
    title="Copy a special link you can open on another device to restore your account"
  >
    Copy Account Link For Other Devices
  </button>
</div>

<div className="mt-8 mb-4 text-center text-xs text-gray-400 flex flex-col items-center">

    <p className="mb-1 tracking-wide text-green-400">Powered by</p>
    <a
      href="https://open.spotify.com/user/31sfywg7ipefpaaldvcpv3jzuc4i?si=bc22a0a934e44b2e"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:opacity-80 transition"
    >
      <img
        src="/spotify-logo.svg"
        alt="Spotify"
        className="w-24 h-auto filter drop-shadow-[0_0_6px_#1DB954] rounded-full border border-green-400 bg-black p-1"
      />
    </a>
  </div>
  {/* PROMOTER DETAILS MODAL */}
      {showPromoterModal && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowPromoterModal(false);
            setPromoterDetails(null);
          }}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-400 rounded-xl p-6 max-w-md w-full relative shadow-[0_0_30px_rgba(250,204,21,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowPromoterModal(false);
                setPromoterDetails(null);
              }}
              className="absolute top-4 right-4 text-white hover:text-yellow-400 text-2xl font-bold"
            >
              ×
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                {selectedPromoter?.nickname || "Promoter"}
              </h2>
              <p className="text-sm text-gray-400">Promoter Profile</p>
            </div>
            
            {promoterDetails ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/50 rounded-lg p-3 border border-yellow-400/30">
                    <div className="text-yellow-400 text-xs uppercase mb-1">Global Rank</div>
                    <div className="text-white text-2xl font-bold">
                      #{promoterDetails.global_rank || "N/A"}
                    </div>
                  </div>
                  
                  <div className="bg-black/50 rounded-lg p-3 border border-green-400/30">
                    <div className="text-green-400 text-xs uppercase mb-1">Total Wins</div>
                    <div className="text-white text-2xl font-bold">
                      🥇 {promoterDetails.total_wins || 0}
                    </div>
                  </div>
                  
                  <div className="bg-black/50 rounded-lg p-3 border border-purple-400/30">
                    <div className="text-purple-400 text-xs uppercase mb-1">Top 10 Hits</div>
                    <div className="text-white text-2xl font-bold">
                      🏆 {promoterDetails.total_top_10s || 0}
                    </div>
                  </div>
                  
                  <div className="bg-black/50 rounded-lg p-3 border border-orange-400/30">
                    <div className="text-orange-400 text-xs uppercase mb-1">Longest Streak</div>
                    <div className="text-white text-2xl font-bold">
                      🔥 {promoterDetails.longest_streak || 0}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-white font-bold mb-3 text-center">Badges Earned</h3>
                  <div className="flex justify-center gap-3">
                    {["streaker", "hitmaker", "charttopper", "dblevel"].map((type) => {
                      const val =
    type === "streaker"
    ? promoterDetails.longest_streak ?? 0
    : type === "hitmaker"
    ? promoterDetails.total_wins ?? 0
    : type === "charttopper"
    ? promoterDetails.total_top_10s ?? 0
    : promoterDetails.highest_decibel ?? 0;
                      
                      let badgeSrc = "/streaker-locked.png";
                      
                      if (type === "streaker") {
                        if (val >= 150) badgeSrc = "/streaker-150.png";
                        else if (val >= 125) badgeSrc = "/streaker-125.png";
                        else if (val >= 100) badgeSrc = "/streaker-gold.png";
                        else if (val >= 50) badgeSrc = "/streaker-silver.png";
                        else if (val >= 25) badgeSrc = "/streaker-bronze.png";
                      } else if (type === "hitmaker") {
                        if (val >= 100) badgeSrc = "/charttopper-100.png";
                        else if (val >= 75) badgeSrc = "/charttopper-75.png";
                        else if (val >= 50) badgeSrc = "/charttopper-gold.png";
                        else if (val >= 20) badgeSrc = "/charttopper-silver.png";
                        else if (val >= 5) badgeSrc = "/charttopper-bronze.png";
                      } else if (type === "charttopper") {
  if (val >= 100) badgeSrc = "/hitmaker-100.png";
  else if (val >= 75) badgeSrc = "/hitmaker-75.png";
  else if (val >= 50) badgeSrc = "/hitmaker-gold.png";
  else if (val >= 25) badgeSrc = "/hitmaker-silver.png";
  else if (val >= 10) badgeSrc = "/hitmaker-bronze.png";
} else if (type === "dblevel") {
  if (val >= 81) badgeSrc = "/dbgold.png";
  else if (val >= 41) badgeSrc = "/dbsilver.png";
  else if (val >= 1) badgeSrc = "/dbbronze.png";
  else badgeSrc = "/dbbronze.png"; // Default to bronze if no score
}
                      
                      return (
                        <div key={type} className="flex flex-col items-center">
                          <img
                            src={badgeSrc}
                            alt={`${type} badge`}
                            className="w-16 h-16 rounded-md object-contain"
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            {type === "streaker" ? "Streaker" : type === "hitmaker" ? "Hit Maker" : type === "charttopper" ? "Chart Topper" : "dB Level"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Share Button - Only show if viewing own profile */}
                {selectedPromoter && localStorage.getItem("bce_user_id") === selectedPromoter.userId && (
                  <div className="mb-6 text-center">
                    <button
                      onClick={handleSharePromoterCard}
                      className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-6 rounded-full transition-all hover:scale-105 shadow-lg"
                    >
                      📤 Share My Promoter Card
                    </button>
                  </div>
                )}
                
                {promoterDetails.topLineup && (
                  <div className="bg-black/50 rounded-lg p-4 border border-yellow-400/30">
                    <h3 className="text-yellow-400 font-bold mb-3 text-center">
                      🔥 Most Voted Lineup
                    </h3>
                    <div className="flex justify-center gap-3 mb-2">
                      {[promoterDetails.topLineup.opener, promoterDetails.topLineup.second_opener, promoterDetails.topLineup.headliner].map((artist, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <img
                            src={artist?.image || "/placeholder.jpg"}
                            alt={artist?.name || "Artist"}
                            className="w-14 h-14 rounded-md object-cover border border-yellow-400"
                          />
                          <span className="text-[10px] text-white font-bold text-center max-w-[4rem] break-words mt-1">
                            {artist?.name || "Artist"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-sm text-yellow-400">
                      {promoterDetails.topLineup.votes || 0} votes
                    </p>
                    <p className="text-center text-xs text-gray-400 mt-1">
                      {promoterDetails.topLineup.prompt}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Loading stats...
              </div>
            )}
          </div>
        </div>
      )}
</div>
<style jsx global>{`
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 1s ease-out forwards;
  }
  @keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}
@keyframes speaker-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
.animate-speaker-pulse {
  animation: speaker-pulse 1s ease-in-out infinite;
}
`}</style>
</div>
);
}

