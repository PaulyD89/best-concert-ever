const Anthropic = require('@anthropic-ai/sdk').default;
const { createClient } = require('@supabase/supabase-js');

// Initialize clients
const anthropic = new Anthropic({ 
  apiKey: process.env.ANTHROPIC_API_KEY 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Bots 26-30 for US
const BOT_USER_IDS = [
  '77ffeca2-7d46-40fe-b968-b19c6763c682', // bot26
  '39ab8d50-2b06-4334-af39-ff7b28469b88', // bot27
  '7e5899cc-9008-4040-b915-f48fa3bad5f8', // bot28
  'e59eec30-f8f6-457c-9e53-1b4e399d3b96', // bot29
  '36d6d938-6f40-40d9-89ab-fd26da1a7174'  // bot30
];

// Previous bots to check against (Bots 16-25)
const PREVIOUS_BOT_IDS = [
  // Bots 16-20
  '9c2a832c-bb42-41be-a8f5-ce1f11cd7dee', // bot16
  '5de947d0-ac9d-4cca-87fc-631d262e3ed9', // bot17
  'df4073ef-57ce-44e2-8252-0fa411056ef8', // bot18
  '19591a1b-2946-4960-bfed-c63abbd5ed5f', // bot19
  '858ff189-2f1b-4d53-957b-1cee1e8a489c', // bot20
  // Bots 21-25
  'dc22678f-776b-42c9-93e1-de0070c17fb8', // bot21
  '11a5d4e9-95d0-475d-aa40-8e6b4a5c2722', // bot22
  'fcc8c9fb-2f5e-4f18-8ba2-b85a1b186816', // bot23
  'e30c51c1-cc66-4449-9a58-b35b25fc60c3', // bot24
  '4e174daa-3baa-4b47-98dc-d1e913b4eaa8'  // bot25
];

async function getTodaysUSPrompt() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('prompts')
    .select('prompt, locked_headliner_data')
    .eq('prompt_date', today)
    .single();
  
  if (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
  
  return data;
}

// Spotify API setup
let spotifyAccessToken = null;

async function getSpotifyAccessToken() {
  if (spotifyAccessToken) return spotifyAccessToken;
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });
  
  const data = await response.json();
  spotifyAccessToken = data.access_token;
  
  return spotifyAccessToken;
}

async function searchSpotifyForArtist(artistName) {
  const token = await getSpotifyAccessToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&market=US&limit=5`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  const artists = data.artists?.items || [];
  
  if (artists.length === 0) {
    return null;
  }
  
  return artists[0];
}

function transformSpotifyArtist(spotifyArtist) {
  return {
    url: spotifyArtist.external_urls?.spotify || '',
    name: spotifyArtist.name,
    image: spotifyArtist.images?.[0]?.url || '',
    enriched: false,
    followers: spotifyArtist.followers?.total || 0,
    spotifyId: spotifyArtist.id,
    popularity: spotifyArtist.popularity || 0,
    radio_spins: 0,
    playlist_count: 0,
    soundcharts_uuid: null,
    soundcharts_score: 0
  };
}

// Check if lineup is duplicate
function isLineupDuplicate(newLineup, existingLineups) {
  const newKey = `${newLineup.opener}|${newLineup.secondOpener}|${newLineup.headliner}`.toLowerCase();
  return existingLineups.some(lineup => {
    const existingKey = `${lineup.opener}|${lineup.secondOpener}|${lineup.headliner}`.toLowerCase();
    return existingKey === newKey;
  });
}

// Get lineups from previous bots today
async function getPreviousBotsLineups(botUserIds) {
  if (botUserIds.length === 0) {
    return []; // No previous bots to check
  }
  
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('lineups')
    .select('opener, second_opener, headliner')
    .in('user_id', botUserIds)
    .gte('created_at', today)
    .lt('created_at', tomorrow);
  
  if (error) {
    console.error('Error fetching previous bot lineups:', error);
    return [];
  }
  
  return data.map(lineup => ({
    opener: lineup.opener.name,
    secondOpener: lineup.second_opener.name,
    headliner: lineup.headliner.name
  }));
}

async function getAIArtistSuggestions(promptText, botNumber, previousLineups = [], lockedHeadliner = null) {
  let previousLineupsText = '';
  if (previousLineups.length > 0) {
    previousLineupsText = '\n\nPreviously submitted lineups (do NOT repeat these exact combinations):\n' + 
      previousLineups.map((lineup, i) => 
        `${i + 1}. ${lineup.opener} → ${lineup.secondOpener} → ${lineup.headliner}`
      ).join('\n');
  }

  const isLocked = !!lockedHeadliner;
  const lockedText = isLocked 
    ? `\n\nIMPORTANT: The headliner is LOCKED as "${lockedHeadliner.name}". Do NOT suggest a different headliner. Only suggest opener and secondOpener.`
    : '';

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Given this concert lineup prompt: "${promptText}"${lockedText}

Suggest ${isLocked ? '2' : '3'} DIFFERENT artists that would be perfect for this theme:
- opener: A good opening act
- secondOpener: A strong second act${isLocked ? '' : '\n- headliner: The main headliner (most famous/appropriate)'}

These must be real, well-known artists that exist on Spotify. Use their most common/official name.${previousLineupsText}

Respond with ONLY a valid JSON object, no other text:
${isLocked 
  ? `{"opener": "Artist Name", "secondOpener": "Artist Name", "headliner": "${lockedHeadliner.name}"}`
  : `{"opener": "Artist Name", "secondOpener": "Artist Name", "headliner": "Artist Name"}`
}`
        }]
      });
      
      const response = message.content[0].text.trim();
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      
      if (isLocked) {
        parsed.headliner = lockedHeadliner.name;
      }
      
      return parsed;
    } catch (error) {
      if (attempt < 3 && error.status === 529) {
        console.log(`Bot ${botNumber}: API overloaded, waiting 10 seconds before retry ${attempt}/3...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      } else {
        throw error;
      }
    }
  }
}

async function submitBotLineup(userId, promptText, openerData, secondOpenerData, headlinerData) {
  const { data, error } = await supabase
    .from('lineups')
    .insert({
      user_id: userId,
      prompt: promptText,
      opener: openerData,
      second_opener: secondOpenerData,
      headliner: headlinerData,
      votes: 0,
      submissions: 0,
      market: 'US',
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to submit lineup: ${error.message}`);
  }
  
  return data;
}

async function processSingleBot(botUserId, promptText, botNumber, submittedLineups, lockedHeadliner = null) {
  const maxRetries = 3;
  
  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      console.log(`🎤 Bot ${botNumber}: Asking Claude for artist suggestions... (attempt ${retry + 1})`);
      const suggestions = await getAIArtistSuggestions(promptText, botNumber, submittedLineups, lockedHeadliner);
      
      // Check if this lineup combo was already submitted
      if (isLineupDuplicate(suggestions, submittedLineups)) {
        console.log(`   ⚠️  Bot ${botNumber}: Duplicate lineup detected, retrying...`);
        continue; // Try again
      }
      
      console.log(`   Bot ${botNumber} suggestions: ${suggestions.opener} / ${suggestions.secondOpener} / ${suggestions.headliner}`);
      
      console.log(`   🔍 Bot ${botNumber}: Searching Spotify for artists...`);
      
      let headlinerData;
      if (lockedHeadliner) {
        console.log(`   🔒 Using locked headliner: ${lockedHeadliner.name}`);
        headlinerData = lockedHeadliner;
      } else {
        const headlinerSpotify = await searchSpotifyForArtist(suggestions.headliner);
        if (!headlinerSpotify) {
          throw new Error(`Could not find headliner on Spotify`);
        }
        headlinerData = transformSpotifyArtist(headlinerSpotify);
      }
      
      const [openerSpotify, secondOpenerSpotify] = await Promise.all([
        searchSpotifyForArtist(suggestions.opener),
        searchSpotifyForArtist(suggestions.secondOpener)
      ]);
      
      if (!openerSpotify || !secondOpenerSpotify) {
        throw new Error(`Could not find all artists on Spotify`);
      }
      
      const openerData = transformSpotifyArtist(openerSpotify);
      const secondOpenerData = transformSpotifyArtist(secondOpenerSpotify);
      
      // Double-check with actual Spotify names
      const finalLineup = {
        opener: openerData.name,
        secondOpener: secondOpenerData.name,
        headliner: headlinerData.name
      };
      
      if (isLineupDuplicate(finalLineup, submittedLineups)) {
        console.log(`   ⚠️  Bot ${botNumber}: Duplicate lineup after Spotify lookup, retrying...`);
        continue;
      }
      
      console.log(`   ✓ Bot ${botNumber} found: ${openerData.name} / ${secondOpenerData.name} / ${headlinerData.name}`);
      
      const submittedLineup = await submitBotLineup(
        botUserId,
        promptText,
        openerData,
        secondOpenerData,
        headlinerData
      );
      
      console.log(`✅ Bot ${botNumber} submitted successfully!`);
      
      return {
        success: true,
        bot: botNumber,
        lineup: `${openerData.name} → ${secondOpenerData.name} → ${headlinerData.name}`,
        lineupId: submittedLineup.id,
        lineupData: finalLineup
      };
      
    } catch (error) {
      if (retry === maxRetries - 1) {
        console.error(`❌ Error with bot ${botNumber} after ${maxRetries} attempts:`, error.message);
        return {
          success: false,
          bot: botNumber,
          error: error.message
        };
      }
    }
  }
}

async function runBotSubmissions() {
  console.log('🤖 Starting US bot lineup submissions (Bots 26-30)...');
  
  const prompt = await getTodaysUSPrompt();
  if (!prompt || !prompt.prompt) {
    throw new Error('No US prompt found for today');
  }
  
  console.log(`📋 US Prompt: ${prompt.prompt}`);
  
  const lockedHeadliner = prompt.locked_headliner_data || null;
  if (lockedHeadliner) {
    console.log(`🔒 LOCKED & LOADED: Headliner is ${lockedHeadliner.name}`);
  }
  
  // Check what bots 16-25 submitted
  console.log('📊 Checking for previous bot lineups (Bots 16-25)...');
  const previousBotLineups = await getPreviousBotsLineups(PREVIOUS_BOT_IDS);
  console.log(`   Found ${previousBotLineups.length} previous bot lineups\n`);
  
  const results = {
    success: [],
    failed: []
  };
  
  // Start with previous lineups, then add new ones as we go
  const submittedLineups = [...previousBotLineups];
  
  // Process bots SEQUENTIALLY to avoid duplicate checking race conditions
  for (let i = 0; i < BOT_USER_IDS.length; i++) {
    const botUserId = BOT_USER_IDS[i];
    const result = await processSingleBot(botUserId, prompt.prompt, i + 26, submittedLineups, lockedHeadliner);
    
    if (result.success) {
      results.success.push(result);
      submittedLineups.push(result.lineupData);
    } else {
      results.failed.push(result);
    }
  }
  
  console.log(`\n📊 FINAL RESULTS (Bots 26-30):`);
  console.log(`✅ Successful: ${results.success.length}/5`);
  console.log(`❌ Failed: ${results.failed.length}/5`);
  
  return results;
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const results = await runBotSubmissions();
    
    res.status(200).json({
      success: true,
      message: `US bot submissions (26-30) complete: ${results.success.length} succeeded, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    console.error('Error running US bot submissions (26-30):', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}