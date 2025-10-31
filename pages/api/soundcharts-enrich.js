// /pages/api/soundcharts-enrich.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { lineupId, openerSpotifyId, secondSpotifyId, headlinerSpotifyId } = req.body;

  if (!lineupId || !openerSpotifyId || !secondSpotifyId || !headlinerSpotifyId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const headers = {
    "x-app-id": process.env.SC_APP_ID,
    "x-api-key": process.env.SC_API_KEY,
  };

  // --- Helper: fetch Soundcharts data for one artist ---
  async function fetchSoundchartsForArtist(spotifyId) {
    try {
      // 1️⃣ Get Soundcharts UUID
      const uuidRes = await fetch(
        `https://customer.api.soundcharts.com/api/v2.9/artist/by-platform/spotify/${spotifyId}`,
        { headers }
      );
      const uuidData = await uuidRes.json();
      const uuid = uuidData?.artist?.uuid;
      if (!uuid) return null;

      // 2️⃣ Popularity
      const popRes = await fetch(
        `https://customer.api.soundcharts.com/api/v2/artist/${uuid}/popularity/spotify`,
        { headers }
      );
      const popData = await popRes.json();
      const popularity = popData.items?.at(-1)?.value ?? null;

      // 3️⃣ Soundcharts Score
      const scoreRes = await fetch(
        `https://customer.api.soundcharts.com/api/v2/artist/${uuid}/soundcharts/score`,
        { headers }
      );
      const scoreData = await scoreRes.json();
      const score = scoreData.items?.at(-1)?.value ?? null;

      // 4️⃣ Radio Spins
      const radioRes = await fetch(
        `https://customer.api.soundcharts.com/api/v2/artist/${uuid}/broadcasts?limit=1`,
        { headers }
      );
      const radioData = await radioRes.json();
      const radio_spins = radioData.items?.length ?? 0;

      // 5️⃣ Playlist Count
      const playlistsRes = await fetch(
        `https://customer.api.soundcharts.com/api/v2.20/artist/${uuid}/playlist/current/spotify`,
        { headers }
      );
      const playlistsData = await playlistsRes.json();
      const playlist_count = playlistsData.items?.length ?? 0;

      return {
        uuid,
        popularity,
        score,
        radio_spins,
        playlist_count,
      };
    } catch (err) {
      console.error("Soundcharts fetch failed for", spotifyId, err);
      return null;
    }
  }

  // --- Fetch data for all three artists ---
  const [openerData, secondOpenerData, headlinerData] = await Promise.all([
    fetchSoundchartsForArtist(openerSpotifyId),
    fetchSoundchartsForArtist(secondSpotifyId),
    fetchSoundchartsForArtist(headlinerSpotifyId),
  ]);

  // --- Fetch the existing lineup row to merge new data ---
  const { data: existingLineup, error: fetchError } = await supabase
    .from("lineups")
    .select("opener, second_opener, headliner")
    .eq("id", lineupId)
    .single();

  if (fetchError || !existingLineup) {
    console.error("Error fetching existing lineup:", fetchError);
    return res.status(404).json({ error: "Lineup not found" });
  }

  // --- Merge Soundcharts data into existing artist JSON ---
  const updatedLineup = {
    opener: { ...existingLineup.opener, soundcharts: openerData },
    second_opener: { ...existingLineup.second_opener, soundcharts: secondOpenerData },
    headliner: { ...existingLineup.headliner, soundcharts: headlinerData },
  };

  // --- Update the lineup row in Supabase ---
  const { error: updateError } = await supabase
    .from("lineups")
    .update(updatedLineup)
    .eq("id", lineupId);

  if (updateError) {
    console.error("Supabase update error:", updateError);
    return res.status(500).json({ error: "Failed to update lineup with Soundcharts data." });
  }

  return res.status(200).json({
    message: "Lineup enriched with Soundcharts data",
    openerData,
    secondOpenerData,
    headlinerData,
  });
}
