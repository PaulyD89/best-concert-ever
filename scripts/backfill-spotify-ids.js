// Resume script to backfill Spotify IDs for old lineups
// Run this with: node scripts/backfill-spotify-ids-resume.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let spotifyAccessToken = null;
let tokenExpiry = null;

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
    // Token expires in 1 hour, set expiry to 55 minutes to be safe
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
      // Retry the request
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

async function backfillLineups() {
  // CONFIGURATION - Change these values to control the batch
  const START_INDEX = 4000;  // Start from lineup 4000
  const END_INDEX = 6000;    // Process up to lineup 6000
  const DELAY_MS = 200;      // Delay between API calls (200ms = 5 requests/second, well under Spotify's limit)
  
  console.log('🎸 Starting Spotify ID backfill (RESUME MODE)...');
  console.log(`📍 Processing lineups ${START_INDEX} to ${END_INDEX}\n`);
  
  // Fetch lineups with pagination
  console.log('📥 Fetching lineups from database...');
  const pageSize = 1000;
  const startPage = Math.floor(START_INDEX / pageSize);
  const endPage = Math.ceil(END_INDEX / pageSize);
  
  let allLineups = [];
  
  for (let page = startPage; page <= endPage; page++) {
    const { data: lineups, error } = await supabase
      .from('lineups')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      console.error('❌ Error fetching lineups:', error);
      return;
    }
    
    allLineups = allLineups.concat(lineups);
    console.log(`   Fetched ${allLineups.length} lineups so far...`);
  }
  
  // Slice to exact range
  const lineupsToProcess = allLineups.slice(
    START_INDEX - (startPage * pageSize),
    END_INDEX - (startPage * pageSize)
  );
  
  console.log(`📊 Processing ${lineupsToProcess.length} lineups\n`);
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  
  for (let i = 0; i < lineupsToProcess.length; i++) {
    const lineup = lineupsToProcess[i];
    const lineupNum = START_INDEX + i;
    
    console.log(`[${lineupNum}/${END_INDEX}] Processing lineup ${lineup.id.substring(0, 8)}...`);
    
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
    
    // Progress checkpoint every 100 lineups
    if ((i + 1) % 100 === 0) {
      console.log(`\n📊 CHECKPOINT: Processed ${i + 1}/${lineupsToProcess.length} lineups`);
      console.log(`   ✅ Updated: ${updated} | ⭐️ Skipped: ${skipped} | ❌ Failed: ${failed}\n`);
    }
  }
  
  console.log('\n📊 BACKFILL COMPLETE!');
  console.log(`✅ Updated: ${updated} lineups`);
  console.log(`⭐️ Skipped: ${skipped} lineups (already had IDs)`);
  console.log(`❌ Failed: ${failed} lineups`);
  console.log(`\n💡 To continue, update START_INDEX to ${END_INDEX} and END_INDEX to ${END_INDEX + 2000}`);
}

// Run the backfill
backfillLineups()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });