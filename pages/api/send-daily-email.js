import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

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
  "Best World Music Lineups",
  "Best 80s Rock",
  "Best 90s Hip-Hop",
  "Best Female Icons",
  "Best Acoustic Acts",
  "Best Garage Bands",
  "Best R&B Bands",
  "Best Funk Bands",
  "Best Festival Headliners",
  "Best Tiny Desk Acts",
  "Best One-Hit Wonders",
  "Best Arena Rock",
  "Best Punk Bands",
  "Best Indie Darlings",
  "Best Sunset Sets",
  "Best After-Hours Artists",
  "Best British Invasion Bands",
  "Best Unplugged Acts",
  "Best Synth Pop Acts",
  "Best Boy Bands",
  "Best Girl Groups",
  "Best Supergroups",
  "Best Country Crossovers",
  "Best World Music Acts",
  "Best Jazz Fusion Groups",
  "Best 2000s Alt Rockers",
  "Best Scandinavian Pop",
  "Best LGBTQ+ Artists",
  "Best Protest Music",
  "Best Ballad Bands",
  "Best Breakup Artists",
  "Best Funk-Pop Crossovers",
  "Best Rappers",
  "Best Covers Acts",
  "Best Super Bowl Halftime Tributes",
  "Best Soul Music Nights",
  "Best Disco Revivals",
  "Best Sadcore Bands",
  "Best New Wave Bands",
  "Best Dad Rock Bands",
  "Best Wine O’Clock Acts",
  "Best Gen Z Anthems",
  "Best Millennial Nostalgia Trip",
  "Best Bass-In-Your-Face Acts",
  "Best Prog Rockers",
  "Best Opening Acts Turned Headliners",
  "Best Throwback Hip-Hop",
  "Best Emo Revival Sets",
  "Best Pop-Punk Bands",
  "Best Riot Grrrl Groups",
  "Best Country Singers",
  "Best Slow Jams",
  "Best Top 10 Talents",
  "Best Alt Pop Artists",
  "Best French Pop",
  "Best Reggae Nights",
  "Best Latin Pop Powerhouses",
  "Best K-Pop Artists",
  "Best TikTok Breakout Artists",
  "Best B-Side Performances",
  "Best Lo-Fi Chill Sets",
  "Best Dream Pop Bands",
  "Best Shoegaze Bands",
  "Best DJs",
  "Best Sibling Bands",
  "Best Movie Soundtrack Stars",
  "Best Vinyl-Only Lineups",
  "Best College Radio Bands",
  "Best Musical Duos",
  "Best Live Collabs",
  "Best Surprise Guests",
  "Best Sad-Girl Artists",
  "Best Rage-to-Redemption Arc Sets",
  "Best Songs You Cried To",
  "Best Make-Out Artists",
  "Best Road Trip Radio",
  "Best Breakout Artists",
  "Best NPR Darlings",
  "Best Hometown Bands",
  "Best Bands from the Future",
  "Best Fictional Bands",
  "Best New York Bands",
  "Best Los Angeles Bands",
  "Best Motown Acts",
  "Best Brass Sections",
  "Best Bands That Broke Up",
  "Best Debut Artists",
  "Best Reunion Tours",
  "Best Farewell Concerts",
  "Best Underrated Icons",
  "Best Artist Comebacks",
  "Best Philly Sound Acts",
  "Best Solo Artists",
  "Best Bands You Saw Before They Blew Up",
  "Best Guilty Pleasures",
  "Best Viral Stars",
  "Best DIY Punk",
  "Best Female Guitarists",
  "Best Motor City Bands",
  "Best Cult Bands",
  "Best Summer Anthem Artists",
  "Best Grunge Bands",
  "Best Eclectic Vibes Only",
  "Best Deep Cuts Night",
  "Best Storytellers",
  "Best Artists With Alter Egos",
  "Best Cover-to-Cover Album Shows",
  "Best Artists Named After Places",
  "Best Artists with Color Names",
  "Best Miami Sound Artists",
  "Best Guitar Heroes",
  "Best Anime Soundtrack Artists",
  "Best Small Venue Vibes",
  "Best Rainy Day Music",
  "Best Sunshine Jams",
  "Best Goth Bands",
  "Best High School Playlist Live",
  "Best Carpool Karaoke Set",
  "Best Techno Artists",
  "Best Cozy Campfire Acts",
  "Best Experimental Artists",
  "Best Thrift Store Artists",
  "Best Album Art Come to Life",
  "Best Artists With One-Word Names",
  "Best Seattle Sound Bands",
  "Best Autotune Artists",
  "Best Artists Who Started on YouTube",
  "Best Artists That Scare You (in a good way)",
  "Best Spoken Word/Poetry Integration",
  "Best Environmental Activists",
  "Best Bands Your Parents Love Too",
  "Best Bands with Food Names",
  "Best Bands with Animal Names",
  "Best Retro Futurism Vibes",
  "Best Rockabilly Acts",
  "Best Artists Who Should’ve Been Bigger",
  "Best Unlikely Collaborations",
  "Best Cosmic Vibes",
  "Best Artists With Iconic Logos",
  "Best Artists to Get Married To",
  "Best Artists to Break Up To",
  "Best Artists That Also Act",
  "Best Bands to Play at 2am",
  "Best Soundtrack to a Movie That Doesn’t Exist",
  "Best Covers of 90s Hits",
  "Best Covers of 80s Ballads",
  "Best SNL Musical Guests",
  "Best MTV VMAs Performers",
  "Best Artists Live",
  "Best Bands With An Actor",
  "Best Artists with Secret Identities",
  "Best Artists You Discovered Randomly",
  "Best Artists Who Grew on You",
  "Best Artists With Iconic Music Videos",
  "Best Bands You Grew Up With",
  "Best Stage Banter",
  "Best Artists to Hear Outdoors",
  "Best Bands to See With Friends",
  "Best Bands to Listen To Alone",
  "Best Artists To Make You Cry",
  "Best Artists To Make You Dance",
  "Best Artists To Fall in Love To",
  "Best Artists For a Montage",
  "Best Artists For a Theme Song",
  "Best Artists With Iconic Debuts",
  "Best Genre Crossover Artists",
  "Best Artist Names You’ve Mispronounced",
  "Best Bands to Cook By",
  "Best Bands to Start Your Day",
  "Best Bands to End Your Day",
  "Best Beach Vibe Bands",
  "Best Skatepark Soundtrack",
  "Best Bands for a Snow Day",
  "Best Bands For a BBQ",
  "Best Artists to Get Lost In",
  "Best Artists for a Night Drive",
  "Best Artists to Fall Asleep To",
  "Best Bands to Time Travel With",
  "Best Artists With Theatrical Live Shows",
  "Best Artists Who Score Movies",
  "Best Singalong Bands",
  "Best Artists That Go Full Chaos Mode",
  "Best Folk Artists",
  "Best Artists for a Good Cry",
  "Best Scream-o Bands",
  "Best Yacht Rockers",
  "Best Dead Artists",
  "Best Jam Bands", 
  "Best Solo Artists - Rock",
  "Best Solo Artists - Country", 
  "Best Solo Artists - R&B",
  "Best Solo Artists - Top 40",
  "Best Solo Artists - Pop",
  "Best Solo Artists - Yacht Rock",
  "Best Solo Artists - Hip-Hop",
  "Best Dynamic Duos",
  "Best Power Trios", 
  "Best Synthwave Bands",
  "Best Alternative Bands",
  "Best Indie Rock Bands",
  "Best Math Rock Bands",
  "Best Soul Music Artists",
  "Best Ska Bands",
  "Best EDM Artists",
  "Best Disco Acts",
  "Best Death Metal Bands",
  "Best Hardcore Bands",
  "Best Christian Metal Bands",
  "Best Canadian Artists",
  "Best Artists From Down Under",
  "Best NWOBHM Bands",
  "Best Synth-Pop Acts",
  "Best Vaporwave Artists",
  "Best Eurovision Winners",
  "Best Party-Starters",
  "Best Vocalists",
  "Best Drummers", 
  "Best Where-Are-They-Now Bands",
  "Best Industrial Artists",
  "Best Psychedelic Bands",
  "Best Instrumental Bands",
  "Best Underground Acts",
  "Best Blues Artists",
  "Best Honky Tonk Artists",
  "Best Southern Rock Bands",
  "Best Lounge Acts",
  "Best Drum & Bass",
  "Best Kraut Rock",
  "Best House Music Artists",
  "Best Mod Music Acts",
  "Best Manchester Sound Bands",
  "Best Cult Bands",
  "Best Hair Metal Bands"

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
  console.log("Running email sender...");
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
  const votes = lineup.votes || 0;
  countMap[key] = (countMap[key] || 0) + 1 + votes;
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

  if (!headliner || !opener || !secondOpener || !dailyPrompt || !yesterdayPrompt) {
    console.error("Missing data for email content:", {
      headliner, opener, secondOpener, dailyPrompt, yesterdayPrompt
    });
    return res.status(500).json({ message: "Incomplete data for email content" });
  }

  const { data: subs, error: subsError } = await supabase
    .from("subscribers")
    .select("email");

  if (subsError || !subs || subs.length === 0) {
    console.error("Error fetching subscribers:", subsError);
    return res.status(500).json({ message: "No subscribers found" });
  }

  const recipients = subs.map((s) => s.email);

  try {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #000; color: white; border-radius: 12px; border: 2px solid #f66;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://best-concert-ever.vercel.app/bcefinalemaillogo.png" 
                alt="Best Concert Ever logo" 
                width="600" height="200" 
        style="display: block; margin: 0 auto;" />
          </div>

          <div style="text-align: center; margin-bottom: 32px;">
  <h1 style="font-size: 28px; color: #ffee33; text-transform: uppercase; font-weight: bold; letter-spacing: 1.5px; margin-bottom: 12px;">
    Today's Challenge
  </h1>
  <div style="display: inline-block; border: 2px solid #ffee33; padding: 6px 14px; font-weight: bold; font-size: 14px; letter-spacing: 1px; color: #ffee33; text-transform: uppercase; background-color: #000; text-shadow: 0 0 5px #ffee33; transform: rotate(-2deg);">
    ${dailyPrompt}
  </div>
</div>

<br/><br/>

<div style="text-align: center; margin-bottom: 24px;"><h1 style="font-size: 28px; color: #ff6b6b; text-transform: uppercase; font-weight: bold; letter-spacing: 1.5px; margin-bottom: 12px;">
              Yesterday's Winning Lineup
            </h1>
            <div style="display: inline-block; border: 2px solid #ff6b6b; padding: 6px 14px; font-weight: bold; font-size: 14px; letter-spacing: 1px; color: #ff6b6b; text-transform: uppercase; background-color: #000; text-shadow: 0 0 5px #ff6b6b; transform: rotate(-2deg);">
              ${yesterdayPrompt}
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <div style="border: 1px solid #444; border-radius: 12px; padding: 10px; background-color: #111; width: 200px; margin: 0 auto;">
              <img src="${headlinerImg}" alt="${headliner}" style="width: 180px; height: 180px; border-radius: 12px;" />
              <div style="font-weight: bold; text-transform: uppercase; margin-top: 10px;">${headliner}</div>
              <div style="font-style: italic; font-size: 12px; color: #aaa;">Headliner</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; max-width: 420px; margin: 0 auto 40px;">
            <div style="text-align: center;">
              <div style="border: 1px solid #444; border-radius: 12px; padding: 8px; background-color: #111; width: 140px; min-height: 220px; display: flex; flex-direction: column; justify-content: space-between;">
                <img src="${openerImg}" alt="${opener}" style="width: 120px; height: 120px; border-radius: 12px;" />
                <div style="font-weight: bold; text-transform: uppercase; margin-top: 8px;">${opener}</div>
                <div style="font-style: italic; font-size: 12px; color: #aaa;">Opener</div>
              </div>
            </div>
            <div style="text-align: center;">
              <div style="border: 1px solid #444; border-radius: 12px; padding: 8px; background-color: #111; width: 140px; min-height: 220px; display: flex; flex-direction: column; justify-content: space-between;">
                <img src="${secondOpenerImg}" alt="${secondOpener}" style="width: 120px; height: 120px; border-radius: 12px;" />
                <div style="font-weight: bold; text-transform: uppercase; margin-top: 8px;">${secondOpener}</div>
                <div style="font-style: italic; font-size: 12px; color: #aaa;">2nd Opener</div>
              </div>
            </div>
          </div>

          <p style="margin-top: 10px; font-size: 16px; text-align: center;">
            Think you have what it takes to be the ultimate Music Promoter?<br/>
            <a href="https://best-concert-ever.vercel.app" style="color: #f66; font-weight: bold;">Submit your own lineup</a>
          </p>

          <p style="margin-top: 30px; font-size: 12px; color: gray; text-align: center;">
            Don’t want to receive these emails? <a href="https://best-concert-ever.vercel.app/unsubscribe" style="color: gray; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>
      `;
    await resend.emails.send({
        from: 'Best Concert Ever <noreply@bestconcertevergame.com>',
        to: recipients,
        subject: `🎸 Today's Prompt & Yesterday's Top Lineup`,
        html
      });
    console.log("Email HTML content:", html);
    return res.status(200).json({ message: "Emails sent" });
  } catch (err) {
    console.error("Failed to send email:", err);
    return res.status(500).json({ message: "Email send failed" });
  }
}
