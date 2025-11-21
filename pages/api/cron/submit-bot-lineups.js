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

// Track submitted lineups to avoid duplicates
let submittedLineups = [];

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

async function getAIArtistSuggestions(promptText, previousLineups = []) {
  let previousLineupsText = '';
  if (previousLineups.length > 0) {
    previousLineupsText = '\n\nPreviously submitted lineups (do NOT repeat these artists or combinations):\n' + 
      previousLineups.map((lineup, i) => 
        `${i + 1}. Opener: ${lineup.opener}, Second: ${lineup.secondOpener}, Headliner: ${lineup.headliner}`
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

Respond with ONLY a valid JSON object, no other text:
{"opener": "Artist Name", "secondOpener": "Artist Name", "headliner": "Artist Name"}`
        }]
      });
      
      const response = message.content[0].text.trim();
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      if (attempt < 3 && error.status === 529) {
        console.log(`API overloaded, waiting 10 seconds before retry ${attempt}/3...`);
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

async function runBotSubmissions() {
  console.log('🤖 Starting bot lineup submissions...');
  
  // Reset submitted lineups for this run
  submittedLineups = [];
  
  const results = {
    success: [],
    failed: []
  };
  
  // Get today's prompt
  const prompt = await getTodaysMexicoPrompt();
  if (!prompt || !prompt.prompt) {
    throw new Error('No prompt found for today');
  }
  
  console.log(`📋 Prompt: ${prompt.prompt}`);
  
  // Submit 15 lineups (without delays - run all at once for serverless)
  for (let i = 0; i < 15; i++) {
    const botUserId = BOT_USER_IDS[i];
    
    try {
      console.log(`🎤 Bot ${i + 1}: Asking Claude for artist suggestions...`);
      const suggestions = await getAIArtistSuggestions(prompt.prompt, submittedLineups);
      console.log(`   Suggestions: ${suggestions.opener} / ${suggestions.secondOpener} / ${suggestions.headliner}`);
      
      console.log(`   🔍 Searching Spotify for artists...`);
      const openerSpotify = await searchSpotifyForArtist(suggestions.opener);
      const secondOpenerSpotify = await searchSpotifyForArtist(suggestions.secondOpener);
      const headlinerSpotify = await searchSpotifyForArtist(suggestions.headliner);
      
      if (!openerSpotify || !secondOpenerSpotify || !headlinerSpotify) {
        throw new Error(`Could not find all artists on Spotify`);
      }
      
      const openerData = transformSpotifyArtist(openerSpotify);
      const secondOpenerData = transformSpotifyArtist(secondOpenerSpotify);
      const headlinerData = transformSpotifyArtist(headlinerSpotify);
      
      console.log(`   ✓ Found: ${openerData.name} / ${secondOpenerData.name} / ${headlinerData.name}`);
      
      const submittedLineup = await submitBotLineup(
        botUserId,
        prompt.prompt,
        openerData,
        secondOpenerData,
        headlinerData
      );
      
      submittedLineups.push({
        opener: openerData.name,
        secondOpener: secondOpenerData.name,
        headliner: headlinerData.name
      });
      
      results.success.push({
        bot: i + 1,
        lineup: `${openerData.name} → ${secondOpenerData.name} → ${headlinerData.name}`,
        lineupId: submittedLineup.id
      });
      
      console.log(`✅ Bot ${i + 1} submitted successfully!`);
      
    } catch (error) {
      console.error(`❌ Error with bot ${i + 1}:`, error.message);
      results.failed.push({
        bot: i + 1,
        error: error.message
      });
    }
  }
  
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
      message: `Bot submissions complete`,
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