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

const didYouKnowTips = [
  "You can win even if you're not the first to submit — votes count too!",
  "If someone wins with a lineup you submitted earlier, you get credit with a Winning Assist.",
  "You only get one vote per day — make it count.",
  "The Most Voted Lineup and the Winner aren’t always the same.",
  "Win 25 days in a row to unlock the Streaker badge!",
  "Streaks reset if you miss a day — don’t break your run!",
  "Early submissions are more likely to earn Winning Assists.",
  "Some badges unlock just by getting 10+ total votes.",
  "A lineup becomes a Deep Cut when the three bands’ combined Spotify followers are under 250,000.",
  "Prompts reset at exactly midnight UTC.",
  "Submitting a lineup just before midnight counts for the previous day.",
  "If multiple people submit the winning lineup, they all get win credit — but only the first gets the public spotlight.",
  "There’s a “Top 10 Lineups” leaderboard updated in real time.",
  "Winning lineups are featured in the next day’s email.",
  "You unlock the Chart Topper badge after making the Top 10 twenty-five times.",
  "Land in the Top 10, ten times, to unlock your first Chart Topper badge.",
  "Once you've had five winning lineups, you'll unlock the Hit Maker badge.",
  "Your Greatest Hits archive stores your top lineups and stats.",
  "Votes are anonymous — no one knows who voted for what.",
  "You can submit lineups on mobile or desktop — it's fully responsive.",
  "You can only vote after you submit your own lineup.",
  "Use niche artists for Deep Cut potential.",
  "After submitting 5 lineups, you can choose your own Promoter nickname.",
  "The Headliner slot is weighted more heavily in tie-breaks.",
  "Some prompts feature “Locked Headliners” — keep an eye out!",
  "You get a badge for reaching 10 total wins.",
  "Want better stats? Submit lineups every day.",
  "Even if you win, submitting late might cost you badge credit.",
  "Share your lineup to get more votes — every fire emoji helps!",
  "Don’t forget to share your lineup on social — your lineup gets additional votes for each person that clicks on it.",
  "Fire = love. The 🔥 icon powers the whole game.",
  "There’s a daily Spotify playlist based on the winning lineup.",
  "If your lineup becomes the day’s playlist — that’s legendary.",
  "Total votes, wins, assists, and submissions all factor into milestones.",
  "You’ll see a special modal popup when you unlock something big.",
  "Miss a day? It doesn’t erase your stats — but it breaks your streak.",
  "Leaderboards update instantly with each vote.",
  "The “Most Voted Lineup” isn’t always the winner — timing matters.",
  "You can only submit one lineup per day.",
  "Prompts are never repeated — every day is brand new.",
  "Vote early and often (well… once per day).",
  "Sharing your lineup increases your visibility to other voters.",
  "Got a win? Share your Greatest Hits graphic on socials!",
  "Your Greatest Hits card updates every night.",
  "If your lineup places in the Top 10 five days in a row — badge time.",
  "No need to register — you can play instantly.",
  "Early submissions are more likely to rack up fire votes.",
  "Curious how many voted for you? Check your fire total.",
  "You can re-use a lineup from a previous day — but no guarantee it’ll win again.",
  "Repeat wins with the same trio earn you respect (but no extra badge).",
  "There’s no “wrong” lineup — just different tastes.",
  "Voters love weird mashups — don't be afraid to mix genres.",
  "The best lineups often blend surprise with nostalgia.",
  "Don’t sleep on 2nd Openers — they’re often the key vote-getters.",
  "You can see yesterday’s winner right on the homepage.",
  "Winning Assists only count if someone else wins with your exact lineup.",
  "Total votes + submission order are used to break ties.",
  "Lineups that win multiple days are rare — and legendary.",
  "Want to go viral? Try a lineup that sparks debate.",
  "The best lineups are clever, nostalgic, and surprising.",
  "Try mixing one classic, one niche, and one rising star.",
  "Themed lineups often stand out: all siblings, all duos, all drummers.",
  "Artists don’t have to be alive to be picked — legends are welcome.",
  "Band reunions? Go for it. They don’t have to be together now.",
  "The fire emoji system is intentionally simple — because music isn’t.",
  "Best Concert Ever is built for music obsessives, nerds, and superfans.",
  "If you win on your first day playing — you're a legend.",
  "Want to be the Deep Cut lineup? Submit underrated acts.",
  "Look out for special prompts tied to holidays or music history.",
  "Some prompts are secretly curated by artists or tastemakers.",
  "Don’t forget to vote — submitting alone doesn’t help your ranking.",
  "Some prompts have a Locked Headliner — it can’t be changed.",
  "Your votes help unlock more than just wins — badges count too.",
  "Click any artist featured in a winning lineup to hear them on Spotify.",
  "If your lineup lands in the Top 10 list at the end of the day, that counts for points towards your badges.",
  "Don’t clear your browser cache or else you’ll lose all your anonymous stats and badge unlocks!"
];

function getDailyDidYouKnowTip() {
  const today = new Date().toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }
  return didYouKnowTips[Math.abs(hash) % didYouKnowTips.length];
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


function buildNewsletterHtml({
  dailyPrompt,
  yesterdayPrompt,
  headlinerImg,
  secondOpenerImg,
  openerImg,
  rawHeadliner,
  rawSecondOpener,
  rawOpener,
  playlistUrl,
  dailyTip
}) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757150384/img-3_j1stcs.jpg"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151925/Group_14_fzk6o6.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151713/Group_13_udwivy.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163833/Yesterday_s_winning_lineup_n0jhza.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757162970/down-zigzag_ivdxyt.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757150411/band-3_h3gklz.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163828/Headliner_ppkp4r.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757150411/band-2_hlrsps.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163827/2nd_Opener_bzgaxi.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757150411/band-1_vf3lj5.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163829/Opener_e2xbpw.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757162969/up-zigzag_yncjjs.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757164433/spotify_safuoq.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757172212/stream-the-winning-lineups_kytpbr.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757170445/button_bzg5o2.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757166457/IMG_1869_r6sg4i.jpg"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167604/crowd_jf7bcu.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167034/best-concert-ever_i4wbjt.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167032/ig_sirgwm.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167033/x_d0d6oy.png"
    />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <!--$-->
  </head>
  <body
    class="darkmode"
    style="
      font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
      background-color: rgb(28, 28, 28) !important;
      padding-top: 0.5rem;
    "
  >
    <table
      align="center"
      width="100%"
      class="darkmode"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="
        background-color: rgb(0, 0, 0) !important;
        max-width: 600px !important;
      "
    >
      <tbody>
        <tr style="width: 100%">
          <td>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="margin: 0px !important"
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757150384/img-3_j1stcs.jpg"
                      style="
                        width: 600px;
                        display: inline-block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                margin-top: 0px !important;
                background-image: url(&#x27;https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151328/Rectangle_48_j4qmze.png&#x27;);
                background-size: auto;
                background-position: center;
                background-repeat: no-repeat;
                width: 600px;
                height: 300px;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        margin-top: 3rem !important;
                        background-image: url(&#x27;https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757156915/concert-ticket_utkrgk.png&#x27;);
                        background-repeat: no-repeat;
                        background-position: center top;
                        background-size: 550px auto;
                        width: 550px;
                        height: 230px;
                        position: relative;
                      "
                    >
                      <tbody>
                        <tr>
                          <td>
                            <p
                              style="
                                margin-left: 1.25rem !important;
                                margin-bottom: 5rem !important;
                                font-size: 1.25rem;
                                line-height: 1.75rem;
                                font-weight: 600;
                                color: rgb(255, 255, 255);
                                margin: 16px 0;
                              "
                            >
                              ${dailyPrompt}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                background-color: rgb(255, 255, 255);
                padding-top: 1rem;
                padding-bottom: 1rem;
                padding-left: 1rem;
                padding-right: 1rem;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151925/Group_14_fzk6o6.png"
                      style="
                        height: 0.5rem;
                        margin-left: auto;
                        margin-right: auto;
                        margin-top: 2rem !important;
                        margin-bottom: 2rem !important;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    /><img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151713/Group_13_udwivy.png"
                      style="
                        height: 7rem;
                        margin-left: auto;
                        margin-right: auto;
                        margin-bottom: 1.5rem;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    /><img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163833/Yesterday_s_winning_lineup_n0jhza.png"
                      style="
                        height: 1.75rem;
                        margin-left: auto;
                        margin-right: auto;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                    <p
                      style="
                        margin-bottom: 2.5rem !important;
                        font-size: 1.875rem;
                        line-height: 2.25rem;
                        font-weight: 600;
                        text-align: center;
                        margin: 16px 0;
                      "
                    >
                      ${yesterdayPrompt}
                    </p>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151925/Group_14_fzk6o6.png"
                      style="
                        height: 0.5rem;
                        margin-left: auto;
                        margin-right: auto;
                        margin-bottom: 2rem !important;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="background-color: rgb(255, 177, 37)"
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757162970/down-zigzag_ivdxyt.png"
                      style="
                        width: 100%;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="padding-top: 2.5rem; padding-bottom: 2.5rem"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="margin-bottom: 1.5rem"
                            >
                              <tbody style="width: 100%">
                                <tr style="width: 100%">
                                  <td
                                    width="55%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        padding-left: 1rem;
                                        padding-right: 1rem;
                                      "
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="${headlinerImg}"
                                              style="
                                                width: 100%;
                                                border-radius: 0.75rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                  <td
                                    width="45%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163828/Headliner_ppkp4r.png"
                                              style="
                                                height: 1.5rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                            <p
                                              style="
                                                font-size: 1.2rem;
                                                font-weight: 700;
                                                line-height: 24px;
                                                margin: 16px 0;
                                              "
                                            >
                                              Spandau ballet
                                            </p>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="margin-bottom: 1.5rem"
                            >
                              <tbody style="width: 100%">
                                <tr style="width: 100%">
                                  <td
                                    width="55%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        padding-left: 1rem;
                                        padding-right: 1rem;
                                      "
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="${secondOpenerImg}"
                                              style="
                                                width: 100%;
                                                border-radius: 0.75rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                  <td
                                    width="45%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163827/2nd_Opener_bzgaxi.png"
                                              style="
                                                height: 1.5rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                            <p
                                              style="
                                                font-size: 1.2rem;
                                                font-weight: 700;
                                                line-height: 24px;
                                                margin: 16px 0;
                                              "
                                            >
                                              My Chemical Romance
                                            </p>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                            >
                              <tbody style="width: 100%">
                                <tr style="width: 100%">
                                  <td
                                    width="55%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        padding-left: 1rem;
                                        padding-right: 1rem;
                                      "
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="${openerImg}"
                                              style="
                                                width: 100%;
                                                border-radius: 0.75rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                  <td
                                    width="45%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163829/Opener_e2xbpw.png"
                                              style="
                                                height: 1.5rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                            <p
                                              style="
                                                font-size: 1.2rem;
                                                font-weight: 700;
                                                line-height: 24px;
                                                margin: 16px 0;
                                              "
                                            >
                                              Seven seconds to midnight
                                            </p>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757162969/up-zigzag_yncjjs.png"
                      style="
                        width: 100%;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                background-color: rgb(255, 255, 255);
                padding-top: 1.5rem;
                padding-bottom: 1.5rem;
                text-align: center;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757164433/spotify_safuoq.png"
                      style="
                        margin-left: auto;
                        margin-right: auto;
                        height: 3.5rem;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    /><img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757172212/stream-the-winning-lineups_kytpbr.png"
                      style="
                        margin-left: auto;
                        margin-right: auto;
                        height: 1.75rem;
                        padding-top: 1rem;
                        padding-bottom: 1rem;
                        margin-bottom: 1rem;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                    <div
                      style="
                        padding-top: 0.75rem;
                        padding-bottom: 0.75rem;
                        padding-left: 0.5rem;
                        padding-right: 0.5rem;
                        text-align: center;
                        font-size: 1rem;
                        font-weight: 600;
                        width: 85%;
                        margin-left: auto;
                        margin-right: auto;
                        border-radius: 1rem;
                        margin-bottom: 2rem;
                        border: 2px dashed #62748e;
                      "
                    >
                      <p
                        style="
                          font-size: 1.15rem;
                          line-height: 24px;
                          margin: 16px 0;
                        "
                      >
                        <a href="${playlistUrl}" style="color:#000; text-decoration:underline; font-weight:700;">${yesterdayPrompt}.Playlist.Ever</a>
                      </p>
                    </div>
                    <p
                      style="
                        font-size: 1.15rem;
                        color: rgb(38, 38, 38);
                        text-align: center;
                        margin-bottom: 1.5rem !important;
                        line-height: 24px;
                        margin: 16px 0;
                      "
                    >
                      Think you have what it takes to be the ultimate Music
                      Promoter?
                    </p>
                    <a
                      href="https://bestconcertevergame.com"
                      style="color: #067df7; text-decoration-line: none"
                      target="_blank"
                      ><img
                        src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757170445/button_bzg5o2.png"
                        style="
                          height: 7rem;
                          vertical-align: middle;
                          display: inline-block;
                          margin-left: 0.5rem;
                          outline: none;
                          border: none;
                          text-decoration: none;
                        "
                    /></a>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="background-color: rgb(250, 223, 106)"
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757162970/down-zigzag_ivdxyt.png"
                      style="
                        width: 100%;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        margin-top: 2rem;
                        margin-bottom: 2rem;
                        padding-top: 1.5rem;
                        padding-bottom: 1.5rem;
                        width: 85%;
                        border-radius: 1rem;
                        border: 2px solid #404040;
                      "
                    >
                      <tbody>
                        <tr>
                          <td>
                            <img
                              src="https://best-concert-ever.vercel.app/email-assets/didyouknow.png?v=20250806"
                              style="
                                height: 9rem;
                                margin-left: auto;
                                margin-right: auto;
                                display: block;
                                outline: none;
                                border: none;
                                text-decoration: none;
                              "
                            />
                            <p
                              style="
                                font-size: 1.15rem;
                                text-align: center;
                                font-weight: 600;
                                line-height: 24px;
                                margin: 16px 0;
                              "
                            >
                              ${dailyTip}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="background-color: rgb(2, 2, 1); padding-bottom: 2rem"
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167604/crowd_jf7bcu.png"
                      style="width: 100%; margin-left: auto; margin-right: auto"
                    /><img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167034/best-concert-ever_i4wbjt.png"
                      style="
                        height: 8rem;
                        margin-left: auto;
                        margin-right: auto;
                        margin-top: 1rem;
                        margin-bottom: 0.5rem;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                    <hr
                      style="
                        height: 1px;
                        width: 60%;
                        margin-left: auto;
                        margin-right: auto;
                        background-color: rgb(204, 204, 204);
                        border-radius: 9999px;
                        margin-top: 2.5rem;
                        border: none;
                        border-top: 1px solid #eaeaea;
                      "
                    />
                    <p
                      style="
                        color: rgb(255, 255, 255);
                        font-size: 1.25rem;
                        text-align: center;
                        line-height: 24px;
                        margin: 16px 0;
                      "
                    >
                      Follow us on social:
                    </p>
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                    >
                      <tbody style="width: 100%">
                        <tr style="width: 100%">
                          <td
                            width="50%"
                            align="right"
                            data-id="__react-email-column"
                          >
                            <a
                              href="https://bestconcertevergame.com"
                              style="color: #067df7; text-decoration-line: none"
                              target="_blank"
                              ><img
                                src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167032/ig_sirgwm.png"
                                style="
                                  height: 2rem;
                                  margin-right: 0.5rem;
                                  display: block;
                                  outline: none;
                                  border: none;
                                  text-decoration: none;
                                "
                            /></a>
                          </td>
                          <td
                            width="50%"
                            align="left"
                            data-id="__react-email-column"
                          >
                            <a
                              href="https://bestconcertevergame.com"
                              style="color: #067df7; text-decoration-line: none"
                              target="_blank"
                              ><img
                                src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167033/x_d0d6oy.png"
                                style="
                                  height: 2rem;
                                  margin-left: 0.5rem;
                                  display: block;
                                  outline: none;
                                  border: none;
                                  text-decoration: none;
                                "
                            /></a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="background-color: rgb(255, 255, 255)"
            >
              <tbody>
                <tr>
                  <td>
                    <p
                      style="
                        color: rgb(64, 64, 64);
                        font-weight: 600;
                        text-align: center;
                        font-size: 0.9rem;
                        line-height: 24px;
                        margin: 16px 0;
                      "
                    >
                      Don&#x27;t want to receive these emails?<!-- -->
                      <a
                        href="https://bestconcertevergame.com"
                        style="color: #067df7; text-decoration-line: none"
                        target="_blank"
                         href="https://bestconcertevergame.com/unsubscribe">Unsubscribe</a
                      >
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>
`;
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
  const dailyTip = getDailyDidYouKnowTip();

  const html = buildNewsletterHtml({ dailyPrompt, yesterdayPrompt, headlinerImg, secondOpenerImg, openerImg, rawHeadliner, rawSecondOpener, rawOpener, playlistUrl, dailyTip });
const messages = recipients.map((email) => ({
    from: 'Best Concert Ever <noreply@bestconcertevergame.com>',
    to: [email],
    subject: `🎺 What's Your Best Concert Ever for "${dailyPrompt}"?`,
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
