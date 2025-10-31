// File: /pages/api/enrich-artist.js
// This API route enriches artist data with Soundcharts metrics

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { spotifyId, artistName } = req.body;
  const APP_ID = 'PDAVIDSON-API_8E0D5B7B';
  const API_KEY = 'a4dfd64d99449094';

  if (!spotifyId) {
    return res.status(400).json({ error: 'Spotify ID required' });
  }

  try {
    console.log(`🎵 Enriching artist: ${artistName} (${spotifyId})`);

    // STEP 1: Get Artist UUID
    const uuidUrl = `https://customer.api.soundcharts.com/api/v2.9/artist/by-platform/spotify/${spotifyId}`;
    const uuidResponse = await fetch(uuidUrl, {
      headers: { 'x-app-id': APP_ID, 'x-api-key': API_KEY }
    });

    if (!uuidResponse.ok) {
      console.error(`❌ Failed to get UUID for ${artistName}`);
      return res.status(200).json({ enriched: false });
    }

    const uuidData = await uuidResponse.json();
    const uuid = uuidData.object?.uuid;

    if (!uuid) {
      console.error(`❌ No UUID found for ${artistName}`);
      return res.status(200).json({ enriched: false });
    }

    console.log(`✅ Got UUID: ${uuid}`);

    // STEP 2: Calculate rolling 30-day window
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const endDateStr = formatDate(endDate);
    const startDateStr = formatDate(startDate);
    
    console.log(`📅 Fetching radio data for: ${startDateStr} to ${endDateStr}`);

    // STEP 3: Fetch all metrics in parallel
    const [popularityRes, scoreRes, radioRes, playlistRes] = await Promise.all([
      fetch(`https://customer.api.soundcharts.com/api/v2/artist/${uuid}/popularity/spotify`, {
        headers: { 'x-app-id': APP_ID, 'x-api-key': API_KEY }
      }),
      fetch(`https://customer.api.soundcharts.com/api/v2/artist/${uuid}/soundcharts/score`, {
        headers: { 'x-app-id': APP_ID, 'x-api-key': API_KEY }
      }),
      fetch(`https://customer.api.soundcharts.com/api/v2/artist/${uuid}/broadcasts?country=US&startDate=${startDateStr}&endDate=${endDateStr}&limit=1`, {
        headers: { 'x-app-id': APP_ID, 'x-api-key': API_KEY }
      }),
      fetch(`https://customer.api.soundcharts.com/api/v2.20/artist/${uuid}/playlist/current/spotify?limit=1`, {
        headers: { 'x-app-id': APP_ID, 'x-api-key': API_KEY }
      })
    ]);

    const popularity = popularityRes.ok ? await popularityRes.json() : null;
    const score = scoreRes.ok ? await scoreRes.json() : null;
    const radio = radioRes.ok ? await radioRes.json() : null;
    const playlists = playlistRes.ok ? await playlistRes.json() : null;

    // Extract values using the correct paths
    const enrichedData = {
      soundcharts_uuid: uuid,
      popularity: popularity?.items?.[0]?.value || 0,
      soundcharts_score: score?.items?.[0]?.scScore || 0,
      radio_spins: radio?.page?.total || 0,
      playlist_count: playlists?.page?.total || 0,
      enriched: true
    };

    console.log(`✅ Enriched ${artistName}:`, enrichedData);

    return res.status(200).json(enrichedData);

  } catch (error) {
    console.error('❌ Soundcharts enrichment error:', error);
    return res.status(200).json({ enriched: false, error: error.message });
  }
}