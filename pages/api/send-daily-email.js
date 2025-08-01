// full updated version of send-daily-email.js with style and order fixes
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getDailyPrompt() {
  const utcDate = new Date().toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < utcDate.length; i++) {
    hash = utcDate.charCodeAt(i) + ((hash << 5) - hash);
  }
  return prompts[Math.abs(hash) % prompts.length];
}

function getYesterdayPrompt() {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() - 1);
  const yesterday = now.toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < yesterday.length; i++) {
    hash = yesterday.charCodeAt(i) + ((hash << 5) - hash);
  }
  return prompts[Math.abs(hash) % prompts.length];
}

async function getSpotifyImageUrl(artistName) {
  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials'
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();
    const artist = searchData.artists?.items?.[0];
    return artist?.images?.[0]?.url || `https://via.placeholder.com/300x300?text=${encodeURIComponent(artistName)}`;
  } catch (err) {
    console.error(`Error fetching Spotify image for ${artistName}:`, err);
    return `https://via.placeholder.com/300x300?text=${encodeURIComponent(artistName)}`;
  }
}

export default async function handler(req, res) {
  const testEmail = req.query.testEmail || req.body?.testEmail;
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const today = new Date();
  const cutoff = new Date("2025-05-01T00:00:00Z");
  let dailyPrompt, yesterdayPrompt;

  if (today >= cutoff) {
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const { data: todayData } = await supabase.from("prompts").select("prompt").eq("prompt_date", todayStr).single();
    const { data: yesterdayData } = await supabase.from("prompts").select("prompt").eq("prompt_date", yesterdayStr).single();

    dailyPrompt = todayData?.prompt || getDailyPrompt();
    yesterdayPrompt = yesterdayData?.prompt || getYesterdayPrompt();
  } else {
    dailyPrompt = getDailyPrompt();
    yesterdayPrompt = getYesterdayPrompt();
  }

  const { data, error } = await supabase
    .from('lineups')
    .select('headliner, opener, second_opener, votes')
    .eq('prompt', yesterdayPrompt);

  if (error || !data) {
    console.error("Error fetching lineups:", error);
    return res.status(500).json({ message: 'Failed to fetch yesterday’s lineup' });
  }

  const countMap = {};
  data.forEach(({ headliner, opener, second_opener, votes }) => {
    const key = `${headliner?.name}|||${opener?.name}|||${second_opener?.name}`;
    countMap[key] = (countMap[key] || 0) + 1 + (votes || 0);
  });

  const maxCount = Math.max(...Object.values(countMap));
  const topLineups = Object.entries(countMap).filter(([_, count]) => count === maxCount);
  const [rawHeadliner, rawOpener, rawSecondOpener] = topLineups[Math.floor(Math.random() * topLineups.length)][0].split("|||");

  const [headlinerImg, openerImg, secondOpenerImg] = await Promise.all([
    getSpotifyImageUrl(rawHeadliner),
    getSpotifyImageUrl(rawOpener),
    getSpotifyImageUrl(rawSecondOpener)
  ]);

  const recipients = testEmail
    ? [testEmail]
    : (await supabase.from("subscribers").select("email")).data.map((s) => s.email);

  if (!recipients || recipients.length === 0) {
    console.error("No recipients found.");
    return res.status(500).json({ message: "No recipients found" });
  }

  const playlistSlug = `${yesterdayPrompt.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}-playlist-ever`;
  const playlistUrl = `https://open.spotify.com/user/31sfywg7ipefpaaldvcpv3jzuc4i?si=11fb7c92a53744e0/${playlistSlug}`;

  const html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color: #000000; font-family: sans-serif; padding: 24px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000; color: #ffffff; border: 2px solid #f66; border-radius: 12px; padding: 24px;">
      <tr><td align="center">
        <img src="https://best-concert-ever.vercel.app/bcefinalemaillogo.png" alt="Best Concert Ever" width="400" style="display: block; margin-bottom: 24px;" />

        <h1 style="font-size: 28px; color: #ffee33; text-transform: uppercase; font-weight: bold; margin-bottom: 12px; text-shadow: 1px 1px 2px #000000;">Today's Challenge</h1>
        <p style="font-size: 16px; color: #ffee33; margin-bottom: 24px; font-weight: bold; text-transform: uppercase;">${dailyPrompt}</p>

        <h2 style="font-size: 22px; color: #ff6b6b; text-transform: uppercase; margin-bottom: 12px; text-shadow: 1px 1px 2px #000000;">Yesterday's Winning Lineup</h2>
        <p style="font-size: 14px; color: #ff6b6b; font-style: normal; font-weight: bold; text-transform: uppercase; margin-bottom: 20px;">${yesterdayPrompt}</p>

        <img src="${headlinerImg}" alt="${rawHeadliner}" width="200" style="border-radius: 12px; margin-bottom: 8px;" />
        <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 20px;">${rawHeadliner} (Headliner)</div>

        <img src="${secondOpenerImg}" alt="${rawSecondOpener}" width="120" style="border-radius: 12px; margin-bottom: 4px;" />
        <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 12px;">${rawSecondOpener} (2nd Opener)</div>

        <img src="${openerImg}" alt="${rawOpener}" width="120" style="border-radius: 12px; margin-bottom: 4px;" />
        <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 24px;">${rawOpener} (Opener)</div>

        <p style="font-size: 14px; color: #ffee33; margin-bottom: 24px;">
          🎧 <strong>Now Streaming:</strong>
          <a href="${playlistUrl}" style="color: #ffee33; text-decoration: underline;">
            ${yesterdayPrompt}.Playlist.Ever
          </a>
        </p>

        <p style="font-size: 16px; margin-bottom: 30px;">
          Think you have what it takes to be the ultimate Music Promoter?<br/>
          <a href="https://bestconcertevergame.com" style="color: #f66; font-weight: bold;">Submit your own lineup</a>
        </p>

        <p style="font-size: 12px; color: gray; text-align: center;">
          Don’t want to receive these emails? <a href="https://bestconcertevergame.com/unsubscribe" style="color: gray; text-decoration: underline;">Unsubscribe</a>
        </p>

      </td></tr>
    </table>
  </td></tr>
</table>`;

const messages = recipients.map((email) => ({
  from: 'Best Concert Ever <noreply@bestconcertevergame.com>',
  to: [email],
  subject: `🎸 What's Your Best Concert Ever for "${dailyPrompt}"?`,
  html,
}));

const chunkArray = (arr, size) =>
  arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];

const messageChunks = chunkArray(messages, 99);

try {
  for (const chunk of messageChunks) {
    await resend.batch.send(chunk);
    console.log(`✅ Sent batch of ${chunk.length} emails`);
  }
  return res.status(200).json({ message: "Emails sent" });
} catch (err) {
  console.error("❌ Failed to send one or more batches:", err);
  return res.status(500).json({ message: "Email send failed" });
}
}