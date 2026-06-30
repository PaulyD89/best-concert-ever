// Script to backfill Spotify IDs for a specific prompt date
// Run this with: node scripts/backfill-specific-date.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let spotifyAccessToken = null;
let tokenExpiry = null;

// CONFIGURATION - Change this to target different dates
const TARGET_DATE = '2025-10-07';  // Format: YYYY-MM-DD

async function getSpotifyAccessToken() {
  // Refresh token if expired or doesn't exist
  if (!spotifyAccessToken || !tokenExpiry || Date.now() >= tokenExpiry) {
    console.log('🔑 Getting new Spotify access token...');
    
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
    tokenExpiry = Date.now() + (55 * 60 * 1000);
    console.log('✅ New token acquired\n');
  }
  
  return spotifyAccessToken;
}

async function searchSpotifyForArtist(artistName, market = 'US') {
  const token = await getSpotifyAccessToken();
  
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&market=${market}&limit=1`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    // Check for rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 30;
      console.log(`   ⏸️  Rate limited! Waiting ${retryAfter} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return searchSpotifyForArtist(artistName, market);
    }
    
    const data = await response.json();
    const artist = data.artists?.items?.[0];
    
    if (!artist) {
      console.log(`   ⚠️  No Spotify match found for: ${artistName}`);
      return null;
    }
    
    return {
      spotifyId: artist.id,
      name: artist.name,
      image: artist.images?.[0]?.url || '',
      followers: artist.followers?.total || 0,
      popularity: artist.popularity || 0,
      url: artist.external_urls?.spotify || ''
    };
  } catch (error) {
    console.error(`   ❌ Error searching for ${artistName}:`, error.message);
    return null;
  }
}

async function backfillSpecificDate() {
  const DELAY_MS = 200;  // 200ms delay between API calls
  
  console.log('🎸 Starting Spotify ID backfill for specific date...');
  console.log(`📅 Target date: ${TARGET_DATE}\n`);
  
  // First, get the prompt for this date
  console.log('📥 Fetching prompt for date...');
  const { data: promptData, error: promptError } = await supabase
    .from('prompts')
    .select('prompt')
    .eq('prompt_date', TARGET_DATE)
    .single();
  
  if (promptError || !promptData) {
    console.error('❌ Error fetching prompt:', promptError);
    console.log('💡 Make sure the date format is correct (YYYY-MM-DD)');
    return;
  }
  
  const targetPrompt = promptData.prompt;
  console.log(`✅ Found prompt: "${targetPrompt}"\n`);
  
  // Fetch all lineups for this prompt
  console.log('📥 Fetching all lineups for this prompt...');
  let allLineups = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: lineups, error } = await supabase
      .from('lineups')
      .select('*')
      .eq('prompt', targetPrompt)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      console.error('❌ Error fetching lineups:', error);
      return;
    }
    
    if (lineups.length === 0) {
      hasMore = false;
    } else {
      allLineups = allLineups.concat(lineups);
      console.log(`   Fetched ${allLineups.length} lineups so far...`);
      page++;
    }
  }
  
  console.log(`📊 Found ${allLineups.length} total lineups for this prompt\n`);
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  
  for (let i = 0; i < allLineups.length; i++) {
    const lineup = allLineups[i];
    const lineupNum = i + 1;
    
    console.log(`[${lineupNum}/${allLineups.length}] Processing lineup ${lineup.id.substring(0, 8)}...`);
    
    let needsUpdate = false;
    let updatedOpener = lineup.opener;
    let updatedSecondOpener = lineup.second_opener;
    let updatedHeadliner = lineup.headliner;
    
    // Check opener
    if (!lineup.opener?.spotifyId) {
      console.log(`   🔍 Searching for opener: ${lineup.opener?.name}`);
      const spotifyData = await searchSpotifyForArtist(lineup.opener?.name, lineup.market || 'US');
      if (spotifyData) {
        updatedOpener = { ...lineup.opener, ...spotifyData };
        needsUpdate = true;
        console.log(`   ✅ Found: ${spotifyData.name} (${spotifyData.spotifyId})`);
      }
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
    
    // Check second opener
    if (!lineup.second_opener?.spotifyId) {
      console.log(`   🔍 Searching for second opener: ${lineup.second_opener?.name}`);
      const spotifyData = await searchSpotifyForArtist(lineup.second_opener?.name, lineup.market || 'US');
      if (spotifyData) {
        updatedSecondOpener = { ...lineup.second_opener, ...spotifyData };
        needsUpdate = true;
        console.log(`   ✅ Found: ${spotifyData.name} (${spotifyData.spotifyId})`);
      }
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
    
    // Check headliner
    if (!lineup.headliner?.spotifyId) {
      console.log(`   🔍 Searching for headliner: ${lineup.headliner?.name}`);
      const spotifyData = await searchSpotifyForArtist(lineup.headliner?.name, lineup.market || 'US');
      if (spotifyData) {
        updatedHeadliner = { ...lineup.headliner, ...spotifyData };
        needsUpdate = true;
        console.log(`   ✅ Found: ${spotifyData.name} (${spotifyData.spotifyId})`);
      }
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
    
    // Update the lineup if needed
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('lineups')
        .update({
          opener: updatedOpener,
          second_opener: updatedSecondOpener,
          headliner: updatedHeadliner
        })
        .eq('id', lineup.id);
      
      if (updateError) {
        console.log(`   ❌ Failed to update lineup: ${updateError.message}`);
        failed++;
      } else {
        console.log(`   💾 Updated lineup in database`);
        updated++;
      }
    } else {
      console.log(`   ⭐️ Already has Spotify IDs, skipping`);
      skipped++;
    }
    
    console.log('');
    
    // Progress checkpoint every 50 lineups
    if ((i + 1) % 50 === 0) {
      console.log(`\n📊 CHECKPOINT: Processed ${i + 1}/${allLineups.length} lineups`);
      console.log(`   ✅ Updated: ${updated} | ⭐️ Skipped: ${skipped} | ❌ Failed: ${failed}\n`);
    }
  }
  
  console.log('\n📊 BACKFILL COMPLETE!');
  console.log(`📅 Date: ${TARGET_DATE}`);
  console.log(`📝 Prompt: "${targetPrompt}"`);
  console.log(`✅ Updated: ${updated} lineups`);
  console.log(`⭐️ Skipped: ${skipped} lineups (already had IDs)`);
  console.log(`❌ Failed: ${failed} lineups`);
}

// Run the backfill
backfillSpecificDate()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });