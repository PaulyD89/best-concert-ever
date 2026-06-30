import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

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
const submittedLineups = [];

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
  
  // Token expires in 1 hour, clear it after 50 minutes
  setTimeout(() => { spotifyAccessToken = null; }, 50 * 60 * 1000);
  
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
  
  // Return the first artist (best match)
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
      // Remove markdown code blocks if present
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      if (attempt < 3 && error.status === 529) {
        console.log(`   ⏳ API overloaded, waiting 10 seconds before retry ${attempt}/3...`);
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

async function main() {
  console.log('🤖 Starting bot lineup submissions...');
  
  // Get today's prompt
  const prompt = await getTodaysMexicoPrompt();
  if (!prompt || !prompt.prompt) {
    console.error('❌ No prompt found for today');
    console.log('💡 Make sure you have a prompt in prompts_mx table with today\'s date');
    return;
  }
  
  console.log(`📋 Prompt: ${prompt.prompt}`);
  console.log(`🎯 Submitting 15 bot lineups with 5-minute intervals...\n`);
  
  // Submit 15 lineups
  for (let i = 0; i < 15; i++) {
    const botUserId = BOT_USER_IDS[i];
    
    try {
      // Step 1: Ask Claude for artist suggestions based on the prompt
      console.log(`🎤 Bot ${i + 1}: Asking Claude for artist suggestions...`);
      const suggestions = await getAIArtistSuggestions(prompt.prompt, submittedLineups);
      console.log(`   Suggestions: ${suggestions.opener} / ${suggestions.secondOpener} / ${suggestions.headliner}`);
      
      // Step 2: Search Spotify for each artist
      console.log(`   🔍 Searching Spotify for artists...`);
      const openerSpotify = await searchSpotifyForArtist(suggestions.opener);
      const secondOpenerSpotify = await searchSpotifyForArtist(suggestions.secondOpener);
      const headlinerSpotify = await searchSpotifyForArtist(suggestions.headliner);
      
      if (!openerSpotify || !secondOpenerSpotify || !headlinerSpotify) {
        console.error(`❌ Bot ${i + 1}: Could not find all artists on Spotify`);
        console.log(`   Missing: ${!openerSpotify ? suggestions.opener : ''} ${!secondOpenerSpotify ? suggestions.secondOpener : ''} ${!headlinerSpotify ? suggestions.headliner : ''}`);
        continue;
      }
      
      // Step 3: Transform to game format
      const openerData = transformSpotifyArtist(openerSpotify);
      const secondOpenerData = transformSpotifyArtist(secondOpenerSpotify);
      const headlinerData = transformSpotifyArtist(headlinerSpotify);
      
      console.log(`   ✓ Found: ${openerData.name} / ${secondOpenerData.name} / ${headlinerData.name}`);
      
      // Step 4: Submit lineup
      const submittedLineup = await submitBotLineup(
        botUserId,
        prompt.prompt,
        openerData,
        secondOpenerData,
        headlinerData
      );
      
      // Track this lineup to avoid duplicates
      submittedLineups.push({
        opener: openerData.name,
        secondOpener: secondOpenerData.name,
        headliner: headlinerData.name
      });
      
      console.log(`✅ Bot ${i + 1} submitted successfully!`);
      console.log(`   Lineup ID: ${submittedLineup.id}`);
      console.log(`   ${openerData.name} → ${secondOpenerData.name} → ${headlinerData.name}\n`);
      
      // Wait 5 minutes before next submission (except for the last one)
      if (i < 14) {
        console.log('⏳ Waiting 5 minutes...\n');
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
      }
      
    } catch (error) {
      console.error(`❌ Error with bot ${i + 1}:`, error.message);
    }
  }
  
  console.log('🎉 All bot submissions complete!');
  console.log(`📊 Successfully submitted ${submittedLineups.length} unique lineups`);
}

main();