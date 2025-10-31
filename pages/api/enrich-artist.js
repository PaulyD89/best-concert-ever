// File: /pages/api/enrich-artist.js
// This API route enriches artist data with Soundcharts metrics

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the artist's Spotify ID from the request
  const { spotifyId, artistName } = req.body;

  // Your Soundcharts credentials
  const APP_ID = 'PDAVIDSON-API_8E0D5B7B';
  const API_KEY = 'a4dfd64d99449094';

  if (!spotifyId) {
    return res.status(400).json({ error: 'Spotify ID required' });
  }

  try {
    console.log(`🎵 Enriching artist: ${artistName} (${spotifyId})`);

    // STEP 1: Get Artist UUID from Soundcharts
    const uuidUrl = `https://customer.api.soundcharts.com/api/v2.9/artist/by-platform/spotify/${spotifyId}`;
    
    const uuidResponse = await fetch(uuidUrl, {
      headers: {
        'x-app-id': APP_ID,
        'x-api-key': API_KEY
      }
    });

    if (!uuidResponse.ok) {
      console.error(`❌ Failed to get UUID for ${artistName}`);
      return res.status(200).json({ enriched: false, error: 'UUID fetch failed' });
    }

    const uuidData = await uuidResponse.json();
    const uuid = uuidData.object?.uuid;

    if (!uuid) {
      console.error(`❌ No UUID found for ${artistName}`);
      return res.status(200).json({ enriched: false, error: 'No UUID' });
    }

    console.log(`✅ Got UUID: ${uuid}`);

    // STEP 2: Fetch all metrics in parallel
    const [popularityRes, scoreRes, radioRes, playlistRes] = await Promise.all([
      // Get Popularity
      fetch(`https://customer.api.soundcharts.com/api/v2/artist/${uuid}/popularity/spotify`, {
        headers: { 'x-app-id': APP_ID, 'x-api-key': API_KEY }
      }),
      
      // Get Soundcharts Score
      fetch(`https://customer.api.soundcharts.com/api/v2/artist/${uuid}/soundcharts/score`, {
        headers: { 'x-app-id': APP_ID, 'x-api-key': API_KEY }
      }),
      
      // Get Radio Spins (last 30 days in US)
      fetch(`https://customer.api.soundcharts.com/api/v2/artist/${uuid}/broadcasts?country=US&startDate=2025-10-01&endDate=2025-10-31&limit=100&offset=0`, {
        headers: { 'x-app-id': APP_ID, 'x-api-key': API_KEY }
      }),
      
      // Get Playlist Entries
      fetch(`https://customer.api.soundcharts.com/api/v2.20/artist/${uuid}/playlist/current/spotify`, {
        headers: { 'x-app-id': APP_ID, 'x-api-key': API_KEY }
      })
    ]);

    // Parse all responses
    const popularity = popularityRes.ok ? await popularityRes.json() : null;
    const score = scoreRes.ok ? await scoreRes.json() : null;
    const radio = radioRes.ok ? await radioRes.json() : null;
    const playlists = playlistRes.ok ? await playlistRes.json() : null;

    // Extract the actual values
    const enrichedData = {
      soundcharts_uuid: uuid,
      popularity: popularity?.items?.[0]?.value || 0,
      soundcharts_score: score?.object?.current || 0,
      radio_spins: radio?.total || 0,
      playlist_count: playlists?.total || 0,
      enriched: true
    };

    console.log(`✅ Enriched ${artistName}:`, enrichedData);

    return res.status(200).json(enrichedData);

  } catch (error) {
    console.error('❌ Soundcharts enrichment error:', error);
    return res.status(200).json({ 
      enriched: false, 
      error: error.message 
    });
  }
}