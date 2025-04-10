import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const prompts = [
  "Best 90s Band Lineup",
  "Best Bands from the 2000s",
  "Best Festival Headliners",
  "Best One-Hit Wonders",
  "Best Indie Bands of the 2010s",
  "Best Garage Rock Revival Bands",
  "Best LA Punk Bands",
  "Best Bands You Saw in High School",
  "Best Synth-Pop Acts",
  "Best British Invasion Artists",
  "Best Grunge Acts",
  "Best Pop-Punk Lineup",
  "Best Supergroups",
  "Best Bands with Only 2 Members",
  "Best Bands with Horn Sections",
  "Best Live Bands Ever",
  "Best Bands That Broke Up Too Soon",
  "Best Comeback Tours",
  "Best Bands Fronted by Women",
  "Best Alt-Rock Artists of the 2000s",
  "Best Bands from New York",
  "Best Bands from the Midwest",
  "Best Summer Festival Lineup",
  "Best Underground Hip-Hop Artists",
  "Best Country Crossover Acts",
  "Best Shoegaze Bands",
  "Best Folk Rock Acts",
  "Best Bands with Wild Stage Shows",
  "Best Bands for a Road Trip",
  "Best Reunion Lineup",
  "Best Scandinavian Artists",
  "Best Emo Bands",
  "Best Acoustic Sets",
  "Best Songs to Cry To Live",
  "Best Arena Rock Bands",
  "Best Punk Revival Acts",
  "Best Bands Who Only Released One Album",
  "Best Funk Fusion Groups",
  "Best Bands from the UK",
  "Best Tiny Desk-Style Lineup",
  "Best Jazz Fusion Acts",
  "Best Experimental Artists",
  "Best Lo-Fi Indie Acts",
  "Best Power Trios",
  "Best MTV Unplugged Artists",
  "Best Cover Bands Ever",
  "Best Pop Acts of the 80s",
  "Best Bands to See at Night",
  "Best College Radio Legends",
  "Best World Music Lineups"
];

function getDailyPrompt() {
  const now = new Date();
  const pacificDate = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  const today = pacificDate.toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }
  return prompts[Math.abs(hash) % prompts.length];
}

function getYesterdayPrompt() {
  const now = new Date();
  const pacificDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  pacificDate.setDate(pacificDate.getDate() - 1);
  const yesterday = pacificDate.toISOString().split("T")[0];
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
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
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
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    const dailyPrompt = getDailyPrompt();
    const yesterdayPrompt = getYesterdayPrompt();
  
    const { data, error } = await supabase
      .from('lineups')
      .select('headliner, opener, second_opener, votes')
      .eq('prompt', yesterdayPrompt);
  
    if (error || !data) {
      console.error("Error fetching lineups:", error);
      return res.status(500).json({ message: 'Failed to fetch yesterday’s lineup' });
    }
  
    const countMap = {};
    data.forEach((lineup) => {
      const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
      countMap[key] = (countMap[key] || 0) + 1;
    });
  
    const maxCount = Math.max(...Object.values(countMap));
    const topLineups = Object.entries(countMap)
      .filter(([_, count]) => count === maxCount)
      .map(([key]) => key.split("|||"));
  
    const [headliner, opener, secondOpener] = topLineups[Math.floor(Math.random() * topLineups.length)];
  
    const [headlinerImg, openerImg, secondOpenerImg] = await Promise.all([
      getSpotifyImageUrl(headliner),
      getSpotifyImageUrl(opener),
      getSpotifyImageUrl(secondOpener)
    ]);
  
    const { data: subs, error: subsError } = await supabase
      .from("subscribers")
      .select("email, id");
  
    if (subsError || !subs || subs.length === 0) {
      console.error("Error fetching subscribers:", subsError);
      return res.status(500).json({ message: "No subscribers found" });
    }
  
    const recipients = subs.map((s) => s.email);
  
    try {
      await resend.emails.send({
        from: 'Best Concert Ever <noreply@bestconcertevergame.com>',
        to: recipients,
        subject: `🎸 Today's Prompt & Yesterday's Top Lineup`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fdf6e3; border-radius: 12px; border: 6px double black;">
            <h1 style="font-size: 24px; text-align: center; margin-bottom: 20px;">🎤 Today's Prompt</h1>
            <p style="font-size: 20px; font-weight: bold; text-align: center; background: black; color: #fdf6e3; padding: 12px; border-radius: 8px;">${dailyPrompt}</p>
  
            <h2 style="font-size: 20px; margin-top: 30px;">🔥 Yesterday's Top Lineup</h2>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div><strong>Headliner:</strong> ${headliner}<br/><img src="${headlinerImg}" alt="${headliner}" width="100" style="border-radius: 8px; margin-top: 4px;"/></div>
              <div><strong>Opener:</strong> ${opener}<br/><img src="${openerImg}" alt="${opener}" width="100" style="border-radius: 8px; margin-top: 4px;"/></div>
              <div><strong>2nd Opener:</strong> ${secondOpener}<br/><img src="${secondOpenerImg}" alt="${secondOpener}" width="100" style="border-radius: 8px; margin-top: 4px;"/></div>
            </div>
  
            <p style="margin-top: 30px; font-size: 16px;">Think you can beat it? Submit your own at:<br/>
              <a href="https://best-concert-ever.vercel.app" style="color: #ff6600; font-weight: bold;">Best Concert Ever</a>
            </p>
  
            <p style="margin-top: 20px; font-size: 12px; color: gray; text-align: center;">
              Don’t want to receive these emails? <a href="https://best-concert-ever.vercel.app/unsubscribe" style="color: gray; text-decoration: underline;">Unsubscribe</a>
            </p>
          </div>
        `,
      });
  
      return res.status(200).json({ message: "Emails sent" });
    } catch (err) {
      console.error("Failed to send email:", err);
      return res.status(500).json({ message: "Email send failed" });
    }
  }
  