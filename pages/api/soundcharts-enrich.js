// /api/soundcharts-enrich.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { lineupId, openerSpotifyId, secondSpotifyId, headlinerSpotifyId } = req.body;

    if (!lineupId) {
      return res.status(400).json({ message: "Missing lineupId" });
    }

    const headers = {
      "x-app-id": "PDAVIDSON-API_8E0D5B7B",
      "x-api-key": "a4dfd64d99449094",
    };

    const BASE = "https://customer.api.soundcharts.com/api/v2.9";

    const getSoundchartsData = async (spotifyId) => {
      if (!spotifyId) return null;

      try {
        // Step 1: Get Soundcharts UUID via Spotify ID
        const metaRes = await fetch(`${BASE}/artist/by-platform/spotify/${spotifyId}`, { headers });
        if (!metaRes.ok) throw new Error(`Meta fetch failed for ${spotifyId}`);
        const meta = await metaRes.json();
        const uuid = meta?.artist?.uuid;
        if (!uuid) return null;

        // Step 2: Fetch individual datasets
        const [popularityRes, scoreRes, radioRes, playlistsRes] = await Promise.all([
          fetch(`${BASE}/artist/${uuid}/popularity/spotify`, { headers }),
          fetch(`https://customer.api.soundcharts.com/api/v2/artist/${uuid}/soundcharts/score`, { headers }),
          fetch(`https://customer.api.soundcharts.com/api/v2/artist/${uuid}/broadcasts`, { headers }),
          fetch(`https://customer.api.soundcharts.com/api/v2.20/artist/${uuid}/playlist/current/spotify`, { headers }),
        ]);

        const popularity = popularityRes.ok ? await popularityRes.json() : null;
        const score = scoreRes.ok ? await scoreRes.json() : null;
        const radio = radioRes.ok ? await radioRes.json() : null;
        const playlists = playlistsRes.ok ? await playlistsRes.json() : null;

        // Step 3: Extract latest values
        const latestPopularity = popularity?.related?.items?.[0]?.value ?? null;
        const scoreValue = score?.related?.items?.[0]?.value ?? null;
        const radioSpins = radio?.related?.items?.length ?? 0;
        const playlistCount = playlists?.related?.items?.length ?? 0;

        return {
          uuid,
          soundcharts: {
            score: scoreValue,
            popularity: latestPopularity,
            radio_spins: radioSpins,
            playlist_count: playlistCount,
          },
        };
      } catch (err) {
        console.error(`Error fetching Soundcharts data for ${spotifyId}:`, err);
        return null;
      }
    };

    // Step 4: Fetch existing lineup
    const { data: existingLineup, error: fetchError } = await supabase
      .from("lineups")
      .select("opener, second_opener, headliner")
      .eq("id", lineupId)
      .single();

    if (fetchError || !existingLineup) throw fetchError;

    // Step 5: Get new Soundcharts data
    const [openerData, secondData, headlinerData] = await Promise.all([
      getSoundchartsData(openerSpotifyId),
      getSoundchartsData(secondSpotifyId),
      getSoundchartsData(headlinerSpotifyId),
    ]);

    // Step 6: Merge new data into existing JSONs
    const updatedOpener = openerData
      ? { ...existingLineup.opener, ...openerData }
      : existingLineup.opener;
    const updatedSecond = secondData
      ? { ...existingLineup.second_opener, ...secondData }
      : existingLineup.second_opener;
    const updatedHeadliner = headlinerData
      ? { ...existingLineup.headliner, ...headlinerData }
      : existingLineup.headliner;

    // Step 7: Update Supabase record
    const { error: updateError } = await supabase
      .from("lineups")
      .update({
        opener: updatedOpener,
        second_opener: updatedSecond,
        headliner: updatedHeadliner,
      })
      .eq("id", lineupId);

    if (updateError) throw updateError;

    console.log(`✅ Lineup ${lineupId} enriched with Soundcharts data`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Soundcharts enrichment failed:", err);
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
}
