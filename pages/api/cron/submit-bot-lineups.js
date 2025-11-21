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

// Your 15 bot user IDs
const BOT_USER_IDS = [
  '825af54d-09dc-44d2-a42e-32133d747fd3',
  '6b5004b3-caf8-47d8-87c7-b3f4e8cb73ab',
  '4c3edaca-f0fa-4854-953c-aa9f2f65f2e1',
  '23f4641e-3cab-4e23-9770-d8ae4e844e69',
  '1717653b-0e34-41a3-af68-e4734c796e64',
  'f9758987-bf0c-4d44-8dfc-e17e473fc6d5',
  'a9c2decc-daa3-4027-b612-68c9294d920a',
  'd2528eae-0b6e-4e86-89bc-0efca58f1cb4',
  '5d5ab78f-a90e-4930-bb5d-0a7d4d64396f',
  'bc3f42f3-3cd2-471a-91b2-8bbb2343c997',
  '986ef143-42e7-4ec1-8324-9084f19a8db0',
  'cdcdb265-ff8b-4a40-bf92-c6ed108de8e4',
  'f916b8f2-831a-4ba3-a9dc-fb0f13aeadad',
  'ad3faa49-bd3f-4e1a-8e71-85e73c5e3050',
  '648b533f-78ca-43c9-9f2c-eb05113e8cb9'
];

async function getTodaysMexicoPrompt() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('prompts_mx')
    .select('*')
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
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&market=MX&limit=5`,
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

async function getAIArtistSuggestions(promptText, botNumber, previousLineups = []) {
  let previousLineupsText = '';
  if (previousLineups.length > 0) {
    previousLineupsText = '\n\nPreviously submitted lineups (do NOT repeat these exact combinations):\n' + 
      previousLineups.map((lineup, i) => 
        `${i + 1}. ${lineup.opener} → ${lineup.secondOpener} → ${lineup.headliner}`
      ).join('\n');
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Given this concert lineup prompt for Mexico: "${promptText}"

Suggest 3 DIFFERENT Mexican or Latin American artists that would be perfect for this theme:
- opener: A good opening act
- secondOpener: A strong second act  
- headliner: The main headliner (most famous/appropriate)

These must be real, well-known artists that exist on Spotify. Use their most common/official name.${previousLineupsText}

Important: This is lineup #${botNumber}. Create a unique combination that's different from the previous ones listed above.

Respond with ONLY a valid JSON object, no other text:
{"opener": "Artist Name", "secondOpener": "Artist Name", "headliner": "Artist Name"}`
        }]
      });
      
      const response = message.content[0].text.trim();
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedResponse);
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
      market: 'MX',
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to submit lineup: ${error.message}`);
  }
  
  return data;
}

// Check if lineup is duplicate
function isLineupDuplicate(newLineup, existingLineups) {
  const newKey = `${newLineup.opener}|${newLineup.secondOpener}|${newLineup.headliner}`.toLowerCase();
  return existingLineups.some(lineup => {
    const existingKey = `${lineup.opener}|${lineup.secondOpener}|${lineup.headliner}`.toLowerCase();
    return existingKey === newKey;
  });
}

// Process a single bot submission with duplicate checking
async function processSingleBot(botUserId, promptText, botNumber, submittedLineups) {
  const maxRetries = 3;
  
  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      console.log(`🎤 Bot ${botNumber}: Asking Claude for artist suggestions... (attempt ${retry + 1})`);
      const suggestions = await getAIArtistSuggestions(promptText, botNumber, submittedLineups);
      
      // Check if this lineup combo was already submitted
      if (isLineupDuplicate(suggestions, submittedLineups)) {
        console.log(`   ⚠️  Bot ${botNumber}: Duplicate lineup detected, retrying...`);
        continue; // Try again
      }
      
      console.log(`   Bot ${botNumber} suggestions: ${suggestions.opener} / ${suggestions.secondOpener} / ${suggestions.headliner}`);
      
      console.log(`   🔍 Bot ${botNumber}: Searching Spotify for artists...`);
      const [openerSpotify, secondOpenerSpotify, headlinerSpotify] = await Promise.all([
        searchSpotifyForArtist(suggestions.opener),
        searchSpotifyForArtist(suggestions.secondOpener),
        searchSpotifyForArtist(suggestions.headliner)
      ]);
      
      if (!openerSpotify || !secondOpenerSpotify || !headlinerSpotify) {
        throw new Error(`Could not find all artists on Spotify`);
      }
      
      const openerData = transformSpotifyArtist(openerSpotify);
      const secondOpenerData = transformSpotifyArtist(secondOpenerSpotify);
      const headlinerData = transformSpotifyArtist(headlinerSpotify);
      
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
  console.log('🤖 Starting bot lineup submissions (BATCH MODE WITH DUPLICATE CHECKING)...');
  
  // Get today's prompt
  const prompt = await getTodaysMexicoPrompt();
  if (!prompt || !prompt.prompt) {
    throw new Error('No prompt found for today');
  }
  
  console.log(`📋 Prompt: ${prompt.prompt}`);
  
  const results = {
    success: [],
    failed: []
  };
  
  const submittedLineups = [];
  
  // Process in batches of 5 to balance speed and uniqueness
  const BATCH_SIZE = 5;
  const batches = [];
  for (let i = 0; i < BOT_USER_IDS.length; i += BATCH_SIZE) {
    batches.push(BOT_USER_IDS.slice(i, i + BATCH_SIZE));
  }
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} bots)...`);
    
    const batchPromises = batch.map((botUserId, indexInBatch) => {
      const overallIndex = batchIndex * BATCH_SIZE + indexInBatch;
      return processSingleBot(botUserId, prompt.prompt, overallIndex + 1, submittedLineups);
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        results.success.push(result.value);
        submittedLineups.push(result.value.lineupData);
      } else if (result.status === 'fulfilled' && !result.value.success) {
        results.failed.push(result.value);
      } else if (result.status === 'rejected') {
        results.failed.push({
          bot: '?',
          error: result.reason?.message || 'Unknown error'
        });
      }
    });
  }
  
  console.log(`\n📊 FINAL RESULTS:`);
  console.log(`✅ Successful: ${results.success.length}/15`);
  console.log(`❌ Failed: ${results.failed.length}/15`);
  
  return results;
}

// API route handler - MUST use default export for Next.js/Vercel
export default async function handler(req, res) {
  // Verify this is coming from Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const results = await runBotSubmissions();
    
    res.status(200).json({
      success: true,
      message: `Bot submissions complete: ${results.success.length} succeeded, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    console.error('Error running bot submissions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}