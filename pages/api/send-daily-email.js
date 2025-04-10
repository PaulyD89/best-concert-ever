import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// same prompt list as in your front end
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const dailyPrompt = getDailyPrompt();
  const yesterdayPrompt = getYesterdayPrompt();

  // Fetch yesterday's lineups from Supabase
  const { data, error } = await supabase
    .from('lineups')
    .select('headliner, opener, second_opener, votes')
    .eq('prompt', yesterdayPrompt);

  if (error || !data) {
    console.error("Error fetching lineups:", error);
    return res.status(500).json({ message: 'Failed to fetch yesterday’s lineup' });
  }

  // Determine the most popular lineup
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

  // Get subscriber emails
const { data: subs, error: subsError } = await supabase
.from("subscribers")
.select("email");

if (subsError || !subs || subs.length === 0) {
console.error("Error fetching subscribers:", subsError);
return res.status(500).json({ message: "No subscribers found" });
}

const recipients = subs.map((s) => s.email);

// Send email via Resend
try {
await resend.emails.send({
  from: 'Best Concert Ever <noreply@bestconcertevergame.com>',
  to: recipients,
  subject: `🎸 Today's Prompt & Yesterday's Top Lineup`,
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="font-size: 24px;">🎤 Today's Prompt</h1>
      <p style="font-size: 20px; font-weight: bold;">${dailyPrompt}</p>

      <h2 style="font-size: 20px; margin-top: 30px;">🔥 Yesterday's Top Lineup</h2>
      <ul style="font-size: 16px; line-height: 1.6;">
        <li><strong>Headliner:</strong> ${headliner}</li>
        <li><strong>Opener:</strong> ${opener}</li>
        <li><strong>2nd Opener:</strong> ${secondOpener}</li>
      </ul>

      <p style="margin-top: 30px;">Think you can beat it? Submit your own at<br/>
      <a href="https://best-concert-ever.vercel.app" style="color: #ff6600;">Best Concert Ever</a></p>
    </div>
  `,
});

return res.status(200).json({ message: "Emails sent" });
} catch (err) {
console.error("Failed to send email:", err);
return res.status(500).json({ message: "Email send failed" });
}
