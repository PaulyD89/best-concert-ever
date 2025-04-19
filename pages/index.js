import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
  const utcDate = new Date(now.toISOString().split("T")[0]); // UTC midnight date string
  const today = utcDate.toISOString().split("T")[0];

  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }

  return prompts[Math.abs(hash) % prompts.length];
}

const dailyPrompt = getDailyPrompt();

function getYesterdayPrompt() {
  const now = new Date();
  const utcDate = new Date(now.toISOString().split("T")[0]);
  utcDate.setDate(utcDate.getDate() - 1);
  const yesterday = utcDate.toISOString().split("T")[0];

  let hash = 0;
  for (let i = 0; i < yesterday.length; i++) {
    hash = yesterday.charCodeAt(i) + ((hash << 5) - hash);
  }

  return prompts[Math.abs(hash) % prompts.length];
}

const yesterdayPrompt = getYesterdayPrompt();


const ArtistSearch = ({ label, onSelect, disabled }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
      setShowDropdown(true);
    };
    
    const delayDebounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={label}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black font-semibold text-sm"
      />
      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-scroll shadow-xl">
          {results.map((artist) => (
            <li
              key={artist.id}
              onClick={() => {
                onSelect({
                  name: artist.name,
                  image: artist.images?.[0]?.url,
                  url: artist.external_urls?.spotify,
                  followers: artist.followers?.total || 0
                });                              
              setQuery("");
              setShowDropdown(false);
            }}
              className="p-2 hover:bg-yellow-100 cursor-pointer flex items-center gap-2 text-sm"
            >
              {artist.images?.[0]?.url && (
                <img src={artist.images[0].url} alt={artist.name} className="w-6 h-6 rounded-full" />
              )}
              {artist.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const LineupSlot = ({ artist, label }) => (
  <div className="flex flex-col items-center">
 <div
  className={`${
    label === "Headliner" ? "w-51 h-51 shadow-[0_0_15px_4px_rgba(253,224,71,0.8)]" : "w-32 h-32"
  } bg-gray-200 border-2 border-black rounded-md overflow-hidden flex items-center justify-center`}
>
  {artist?.image ? (
    <img
    src={artist.image}
      alt={artist.name}
      className="w-full h-full object-cover"
      crossOrigin="anonymous"
    />
  ) : (
    <span className="text-black text-xs font-bold text-center w-full text-center block">{label}</span>
  )}
</div>
<div className="mt-2 text-black font-bold text-center max-w-[8rem]">
  {artist?.name || ""}
</div>
  </div>
);

export default function BestConcertEver() {
  const [submittedCount, setSubmittedCount] = useState(null);
  const [winningAssistsCount, setWinningAssistsCount] = useState(null);
  const [topTenCount, setTopTenCount] = useState(null);
  const [longestStreak, setLongestStreak] = useState(null);
  const [winningCount, setWinningCount] = useState(null);
  const [mostVotedLineup, setMostVotedLineup] = useState(null);
  const flyerRef = React.useRef(null);
  const downloadRef = React.useRef(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
const [showEmailSignup, setShowEmailSignup] = useState(false);
const [email, setEmail] = useState("");
const [emailSubmitted, setEmailSubmitted] = useState(false);

const handleEmailSignup = async () => {
  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (res.ok) {
      setEmailSubmitted(true);
    } else {
      alert("There was a problem signing up. Try again later.");
    }
  } catch (err) {
    console.error("Email signup error:", err);
  }
};

  const [lineups, setLineups] = useState([]);
  const [deepCutLineup, setDeepCutLineup] = useState(null);
  const [yesterdaysWinner, setYesterdaysWinner] = useState(null);


  useEffect(() => {
    const fetchSubmittedCount = async () => {
      const userId = localStorage.getItem("bce_user_id");
      if (!userId) return;

      const { data, count, error } = await supabase
        .from("lineups")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (!error) {
        setSubmittedCount(count);
      } else {
        console.error("Failed to fetch submitted count", error);
      }
    };

    fetchSubmittedCount();

    const fetchTopTenCount = async () => {
      const userId = localStorage.getItem("bce_user_id");
      if (!userId) return;

      const { data: userLineups, error: userError } = await supabase
        .from("lineups")
        .select("headliner, opener, second_opener, prompt")
        .eq("user_id", userId);

      if (userError || !userLineups) {
        console.error("Error fetching user lineups:", userError);
        return;
      }

      const { data: allLineups, error: allError } = await supabase
        .from("lineups")
        .select("headliner, opener, second_opener, prompt, votes");

      if (allError || !allLineups) {
        console.error("Error fetching all lineups:", allError);
        return;
      }

      const lineupsByPrompt = {};
      allLineups.forEach((lineup) => {
        const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
        const prompt = lineup.prompt;
        const votes = lineup.votes || 0;

        if (!lineupsByPrompt[prompt]) lineupsByPrompt[prompt] = {};
        lineupsByPrompt[prompt][key] = (lineupsByPrompt[prompt][key] || 0) + 1 + votes;
      });

      const top10KeysPerPrompt = {};
      Object.entries(lineupsByPrompt).forEach(([prompt, lineups]) => {
        const sorted = Object.entries(lineups)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([key]) => key);
        top10KeysPerPrompt[prompt] = sorted;
      });

      const userKeys = userLineups.map(
        (lineup) => `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`
      );

      let totalTop10s = 0;
      Object.entries(top10KeysPerPrompt).forEach(([prompt, keys]) => {
        keys.forEach((key) => {
          if (userKeys.includes(key)) totalTop10s++;
        });
      });

      setTopTenCount(totalTop10s);
    };

    fetchTopTenCount();

    const fetchTopLineups = async () => {
      const { data, error } = await supabase
      .from("lineups")
      .select("id, headliner, opener, second_opener, votes")
      .eq("prompt", dailyPrompt);    

    if (!error && data) {
      const countMap = {};

      data.forEach((lineup) => {
        const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
        const votes = lineup.votes || 0;
        countMap[key] = (countMap[key] || 0) + 1 + votes;
      });      

      const sortedLineups = Object.entries(countMap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([key]) => {
    const [headlinerName, openerName, secondOpenerName] = key.split("|||");

    const matchingLineup = data.find(
      (entry) =>
        entry.headliner?.name === headlinerName &&
        entry.opener?.name === openerName &&
        entry.second_opener?.name === secondOpenerName
    );

    return matchingLineup ?? {
      headliner: { name: headlinerName },
      opener: { name: openerName },
      second_opener: { name: secondOpenerName }
    };
  });

setLineups(sortedLineups);
      }
    };

    fetchTopLineups();

    const fetchDeepCutLineup = async () => {
      const now = new Date();
      const utcMidnight = new Date();
      utcMidnight.setUTCHours(0, 0, 0, 0);

      const tenHoursLater = new Date(utcMidnight.getTime() + 10 * 60 * 60 * 1000);

      if (now < tenHoursLater) return;

      const { data, error } = await supabase
        .from("lineups")
        .select("id, headliner, opener, second_opener, votes")
        .eq("prompt", dailyPrompt);

      if (error || !data) return;

      const eligible = data.filter(lineup => {
        const totalFollowers =
          (lineup.headliner?.followers || 0) +
          (lineup.opener?.followers || 0) +
          (lineup.second_opener?.followers || 0);
        return totalFollowers < 250000;
      });

      if (eligible.length > 0) {
        const randomIndex = Math.floor(Math.random() * eligible.length);
        setDeepCutLineup(eligible[randomIndex]);
      }
    };

    fetchDeepCutLineup();


    const fetchLongestStreak = async () => {
      const userId = localStorage.getItem("bce_user_id");
      if (!userId) return;

      const { data, error } = await supabase
        .from("lineups")
        .select("created_at")
        .eq("user_id", userId);

      if (error || !data) {
        console.error("Failed to fetch streak data:", error);
        return;
      }

      const dates = [...new Set(data.map(d => new Date(d.created_at).toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" })))]
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => a - b);

      let longest = 0, current = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          current++;
          longest = Math.max(longest, current);
        } else {
          current = 1;
        }
      }

      setLongestStreak(dates.length === 1 ? 1 : Math.max(longest, 1));
    };

    fetchLongestStreak();

    const fetchMostVotedLineup = async () => {
      const userId = localStorage.getItem("bce_user_id");
      if (!userId) return;

      const { data, error } = await supabase
        .from("lineups")
        .select("headliner, opener, second_opener, votes")
        .eq("user_id", userId);

      if (error || !data) {
        console.error("Failed to fetch most voted lineup:", error);
        return;
      }

      const sorted = data
        .filter(l => l.votes && l.votes > 0)
        .sort((a, b) => (b.votes || 0) - (a.votes || 0));

      if (sorted.length > 0) {
        setMostVotedLineup(sorted[0]);
      }
    };

    fetchMostVotedLineup();

    fetchMostVotedLineup();

    const fetchWinningCount = async () => {
      const userId = localStorage.getItem("bce_user_id");
      if (!userId) return;
    
      const { data: userLineups, error: userError } = await supabase
        .from("lineups")
        .select("headliner, opener, second_opener, prompt")
        .eq("user_id", userId);
    
      if (userError || !userLineups) {
        console.error("Error fetching user lineups:", userError);
        return;
      }
    
      const { data: allLineups, error: allError } = await supabase
        .from("lineups")
        .select("headliner, opener, second_opener, prompt, user_id, created_at, votes");
    
      if (allError || !allLineups) {
        console.error("Error fetching all lineups:", allError);
        return;
      }
    
      const winnersByPrompt = {};
      allLineups.forEach((lineup) => {
        const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
        const prompt = lineup.prompt;
        const votes = lineup.votes || 0;
        winnersByPrompt[prompt] = winnersByPrompt[prompt] || {};
        winnersByPrompt[prompt][key] = (winnersByPrompt[prompt][key] || 0) + 1 + votes;
      });
    
      let winTotal = 0;
      for (const [prompt, entries] of Object.entries(winnersByPrompt)) {
        const sorted = Object.entries(entries).sort((a, b) => b[1] - a[1]);
        const [topKey] = sorted[0];
    
        const matchingLineups = allLineups.filter((l) => {
          const lineupKey = `${l.headliner?.name}|||${l.opener?.name}|||${l.second_opener?.name}`;
          return lineupKey === topKey && l.prompt === prompt;
        });
    
        const sortedByTime = matchingLineups.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        if (!sortedByTime.length || !sortedByTime[0]?.user_id) continue;
        const firstUserId = sortedByTime[0].user_id;
    
        // Update total_wins for first submitter
        await supabase
          .from("users")
          .update({ total_wins: supabase.raw("total_wins + 1") })
          .eq("user_id", firstUserId);
    
        // Update winning_assists for all others
        const assistUserIds = [...new Set(
          sortedByTime.slice(1).map((l) => l.user_id).filter((id) => id !== firstUserId)
        )];
    
        for (const assistId of assistUserIds) {
          await supabase
            .from("users")
            .update({ winning_assists: supabase.raw("winning_assists + 1") })
            .eq("user_id", assistId);
        }
    
        userLineups.forEach((userLineup) => {
          const userKey = `${userLineup.headliner?.name}|||${userLineup.opener?.name}|||${userLineup.second_opener?.name}`;
          if (userKey === topKey && userLineup.prompt === prompt && userId === firstUserId) {
            winTotal++;
          }
        });
      }
    
      setWinningCount(winTotal);
    };
    fetchWinningCount();
    const fetchWinningAssists = async () => {
      const userId = localStorage.getItem("bce_user_id");
      if (!userId) return;
    
      const { data, error } = await supabase
        .from("users")
        .select("winning_assists")
        .eq("user_id", userId)
        .single();
    
      if (!error && data) {
        setWinningAssistsCount(data.winning_assists);
      }
    };
    fetchWinningAssists();       

  }, []);

  useEffect(() => {
    const fetchYesterdaysWinner = async () => {
      const { data, error } = await supabase
        .from("lineups")
        .select("headliner, opener, second_opener, votes")
        .eq("prompt", yesterdayPrompt);
  
      if (error || !data) return;
  
      const countMap = {};
  
      data.forEach((lineup) => {
        const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
        const votes = lineup.votes || 0;
        countMap[key] = (countMap[key] || 0) + 1 + votes;
      });      
  
      const maxCount = Math.max(...Object.values(countMap));
      const topLineups = Object.entries(countMap)
        .filter(([_, count]) => count === maxCount)
        .map(([key]) => {
          const [headliner, opener, second_opener] = key.split("|||");
          return {
            headliner: data.find(d => d.headliner?.name === headliner)?.headliner,
            opener: data.find(d => d.opener?.name === opener)?.opener,
            second_opener: data.find(d => d.second_opener?.name === second_opener)?.second_opener
          };
        });
  
      const winner = topLineups[Math.floor(Math.random() * topLineups.length)];
      setYesterdaysWinner(winner);
    };
  
    fetchYesterdaysWinner();
  }, []);  

  const [headliner, setHeadliner] = useState(null);
  const [opener, setOpener] = useState(null);
  const [secondOpener, setSecondOpener] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (headliner && opener && secondOpener) {
      if (!localStorage.getItem("bce_user_id")) {
        localStorage.setItem("bce_user_id", crypto.randomUUID());
      }
      const userId = localStorage.getItem("bce_user_id");

      // Check if user exists in users table
const { data: existingUser, error: userCheckError } = await supabase
.from("users")
.select("user_id")
.eq("user_id", userId)
.single();

if (!existingUser) {
  if (userCheckError) {
    console.error("User check failed:", userCheckError);
  } else {
    const { error: insertError } = await supabase.from("users").insert([
      {
        user_id: userId,
        total_wins: 0,
        total_top_10s: 0,
        winning_assists: 0
      }
    ]);

    if (insertError) {
      console.error("Insert failed:", insertError);
    } else {
      console.log("✅ New user added to users table:", userId);
    }
  }
}
  
      const { data: existing, error: checkError } = await supabase
        .from("lineups")
        .select("id")
        .eq("user_id", userId)
        .eq("prompt", dailyPrompt);
  
      if (checkError) {
        console.error("Error checking existing submission:", checkError);
        alert("There was an error checking your previous submission.");
        return;
      }
  
      if (existing.length > 0) {
        alert("You've already submitted a lineup for today's prompt!");
        return;
      }
  
      const { error } = await supabase.from("lineups").insert([
        {
          prompt: dailyPrompt,
          headliner,
          opener,
          second_opener: secondOpener,
          user_id: userId,
        },
      ]);
  
      if (error) {
        console.error("Submission error:", error);
        alert("There was an error submitting your lineup.");
        return;
      }
  
      setSubmitted(true);
      console.log("Lineup submitted:", { headliner, opener, secondOpener });
    }
  };  

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-10 px-4 bg-gradient-to-b from-[#0f0f0f] to-[#1e1e1e] text-white font-sans">
{showHowToPlay && (
        <div className="fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#fdf6e3] text-black p-6 rounded-2xl w-[90%] max-w-xl text-left relative shadow-2xl border-[6px] border-black border-double">
            <button
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-black"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">HOW TO PLAY</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Time to flex those Music Promoter skills and show everyone you know how to assemble the ULTIMATE CONCERT LINE-UP!</li>
              <li>CHECK THE DAILY PROMPT for the genre of the show you&apos;re promoting. Then use the drop-down menus to select THREE ARTISTS who fit the bill.</li>
              <li>CHOOSE THE ORDER for your show - the OPENER, 2ND OPENER and HEADLINER. You can only pick an artist once per game.</li>
              <li>Once you have made your selections, hit <b>SUBMIT LINEUP</b>. Click DOWNLOAD LINEUP for your own personal concert poster that you can SHARE ON SOCIAL MEDIA.</li>
              <li>Today&apos;s TOP 10 most popular will be posted daily. You can VOTE once per day on the Top 10 by clicking the FIRE EMOJI. Sometimes a player&apos;s DEEP CUT could also show up.</li>
              <li>Your winning lineups and those you help win contribute towards YOUR GREATEST HITS.</li>
              <li>NEW GAMES and YESTERDAY&apos;S WINNERS are posted every single day at 5pm PST.</li>
            </ul>
            <div className="text-center mt-6">
              <button
                onClick={() => setShowHowToPlay(false)}
                className="inline-block bg-black text-white text-lg px-6 py-2 rounded-full border-2 border-black shadow-md hover:bg-yellow-300 hover:text-black"
              >
                Let&apos;s Play!
              </button>
            </div>
          </div>
        </div>
      )}
    <div className="flex flex-col items-center justify-start min-h-screen py-10 px-4 bg-gradient-to-b from-[#0f0f0f] to-[#1e1e1e] text-white font-sans">
      <div ref={flyerRef} className="relative bg-[#fdf6e3] text-black rounded-xl shadow-2xl p-6 w-full max-w-md text-center border-[6px] border-black border-double bg-[url('/scratchy-background.png')] bg-repeat bg-opacity-30"
    >
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-white rounded-full border-4 border-black shadow-lg flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="Best Concert Ever Logo" className="w-full h-full object-cover" style={{ objectFit: "cover", objectPosition: "center" }} crossOrigin="anonymous" />
        </div>

        <div className="mt-16 mb-4 text-base font-extrabold uppercase tracking-widest text-black inline-block px-4 py-1 border-2 border-black rotate-[-2deg] bg-white shadow-md font-mono">
          {dailyPrompt}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <ArtistSearch label="Opener" onSelect={setOpener} disabled={submitted} />
          <ArtistSearch label="2nd Opener" onSelect={setSecondOpener} disabled={submitted} />
        </div>

        <ArtistSearch label="Headliner" onSelect={setHeadliner} disabled={submitted} />

        <div className="mt-8 grid grid-cols-2 gap-4 items-start justify-center">
          <LineupSlot artist={opener} label="Opener" />
          <LineupSlot artist={secondOpener} label="2nd Opener" />
        </div>

        <div className="mt-4">
          <LineupSlot artist={headliner} label="Headliner" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={handleSubmit}
            disabled={submitted || !(headliner && opener && secondOpener)}
            className={`px-6 py-2 rounded-full font-bold uppercase tracking-wide transition shadow ${
              submitted || !(headliner && opener && secondOpener)
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-black text-yellow-300 hover:bg-yellow-400 hover:text-black"
            }`}
          >
            Submit Lineup
          </button>
          <button
  onClick={async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    const background = new Image();
    background.src = "/bestconcertdownloadimage.png";
    background.crossOrigin = "anonymous";
  
    background.onload = async () => {
      const WIDTH = background.width;
      const HEIGHT = background.height;
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
  
      ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
  
      const loadImage = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = src;
          img.onload = () => resolve(img);
        });
  
      try {
        const [headlinerImg, openerImg, secondOpenerImg] = await Promise.all([
          loadImage(headliner?.image),
          loadImage(opener?.image),
          loadImage(secondOpener?.image),
        ]);
  
ctx.drawImage(headlinerImg, WIDTH / 2 - 125, HEIGHT - 660, 250, 250);
ctx.drawImage(openerImg, WIDTH / 2 - 250, HEIGHT - 380, 200, 200);
ctx.drawImage(secondOpenerImg, WIDTH / 2 + 50, HEIGHT - 380, 200, 200);

ctx.font = "bold 24px Arial";
ctx.fillStyle = "#ffffff";
ctx.textAlign = "center";

ctx.fillText(headliner?.name || "", WIDTH / 2, HEIGHT - 440 + 40);
ctx.fillText(opener?.name || "", WIDTH / 2 - 140, HEIGHT - 160);
ctx.fillText(secondOpener?.name || "", WIDTH / 2 + 140, HEIGHT - 160);

  
        const link = document.createElement("a");
        link.download = "best-concert-ever.jpg";
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click();
      } catch (err) {
        console.error("Image download failed:", err);
      }
    };
  }}
                 
            disabled={!submitted}
            className={`px-6 py-2 rounded-full font-bold uppercase tracking-wide border transition ${
              submitted
                ? "border-black bg-white text-black hover:bg-yellow-100"
                : "text-gray-400 border-gray-500 cursor-not-allowed"
            }`}
          >
            Download Lineup
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-300 underline cursor-pointer hover:text-white" onClick={() => setShowHowToPlay(true)}>
  How to Play
</div>
<div className="mb-8 text-sm text-gray-300 underline cursor-pointer hover:text-white" onClick={() => setShowEmailSignup(true)}>
  Sign Up for Daily Puzzles & Winners
</div>

      <div className="mt-12 flex justify-center items-center w-full">
        <div className="relative w-full max-w-md text-center">
          <div className="absolute inset-0 rounded-xl border-2 border-yellow-400 animate-pulse pointer-events-none"></div>
          <div className="relative bg-black rounded-xl p-6 border-2 border-yellow-400">
            <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 text-yellow-400 drop-shadow-[0_0_12px_yellow]">
              Today&apos;s Top 10
            </h2>
            <ul className="flex flex-col gap-4 items-center">
  {lineups.map((lineup, idx) => {
    const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
    const hasVoted = localStorage.getItem(`bce-voted-${dailyPrompt}`);

    return (
      <li key={idx} className="text-white text-center">
        <div>
        {lineup.opener?.name} / {lineup.second_opener?.name} / {lineup.headliner?.name}
        </div>
        {!hasVoted && (
          <button
          onClick={async () => {
            localStorage.setItem(`bce-voted-${dailyPrompt}`, key);
          
            if (!lineup.id) {
              alert("Oops, could not find lineup to vote for.");
              return;
            }
            
            const { error: voteError } = await supabase
              .from("lineups")
              .update({ votes: (lineup.votes || 0) + 1 })
              .eq("id", lineup.id);            
          
              if (voteError) {
                console.error("Vote failed:", voteError);              
              alert("Oops, there was an issue recording your vote.");
            } else {
              alert("🔥 Your vote has been counted!");
              window.location.reload();
            }
          }}          
            className="mt-1 text-xl hover:scale-110 transition-transform"
            title="Vote for this lineup"
          >
            🔥
          </button>
        )}
      </li>
    );
  })}
</ul>

{deepCutLineup && (
  <div className="mt-6 text-center border-t border-yellow-400 pt-4">
    <div className="text-yellow-400 font-bold mb-1 text-md">🎧 Deep Cut of the Day</div>
    <div className="text-white text-sm">
      {deepCutLineup.opener?.name} / {deepCutLineup.second_opener?.name} / {deepCutLineup.headliner?.name}
    </div>

    {!localStorage.getItem(`bce-voted-${dailyPrompt}`) && (
      <button
        onClick={async () => {
          localStorage.setItem(`bce-voted-${dailyPrompt}`, "deepcut");

          if (!deepCutLineup.id) {
            alert("Oops, could not find Deep Cut lineup to vote for.");
            return;
          }

          const { error: voteError } = await supabase
            .from("lineups")
            .update({ votes: (deepCutLineup.votes || 0) + 1 })
            .eq("id", deepCutLineup.id);

          if (voteError) {
            console.error("Vote failed:", voteError);
            alert("Oops, there was an issue recording your vote.");
          } else {
            alert("🔥 Your vote for the Deep Cut has been counted!");
            window.location.reload();
          }
        }}
        className="mt-1 text-xl hover:scale-110 transition-transform"
        title="Vote for this Deep Cut lineup"
      >
        🔥
      </button>
    )}
  </div>
)}
          </div>
        </div>
      </div>

      {yesterdaysWinner && (
        <div className="mt-12 flex justify-center items-center w-full">
          <div className="relative w-full max-w-md text-center">
          <div className="absolute inset-0 -z-10 rounded-xl border-2 border-red-400 animate-pulse"></div>

            <div className="relative bg-black rounded-xl p-6 border-2 border-red-400">
              <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 text-red-400 drop-shadow-[0_0_12px_red]">
                Yesterday&apos;s Winning Lineup
              </h2>
              <div className="mb-6 text-base font-extrabold uppercase tracking-widest text-red-400 inline-block px-4 py-1 border-2 border-red-400 rotate-[-2deg] bg-black shadow-md font-mono">
                {yesterdayPrompt}
              </div>
              <ul className="flex flex-col gap-4 items-center">
                {[yesterdaysWinner.headliner, yesterdaysWinner.second_opener, yesterdaysWinner.opener].map((artist, idx) => (
                  <li key={idx} className="text-white flex flex-col items-center">
                    <div className="group">
                      <a href={artist?.url} target="_blank" rel="noopener noreferrer">
                      <img
  src={artist?.image}
  alt={artist?.name}
  className={`rounded-full mb-2 object-cover border-2 group-hover:scale-105 transition-transform duration-200 ${
    idx === 0
      ? 'w-32 h-32 border-yellow-300 shadow-[0_0_15px_4px_rgba(253,224,71,0.8)]'
      : 'w-24 h-24 border-red-400 shadow-[0_0_8px_#f87171]'
  }`}
/>

                      </a>
                    </div>
                    <span className={`font-bold ${idx === 0 ? 'text-lg' : ''}`}>{artist?.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
<div ref={downloadRef} className="absolute left-[-9999px]">
  <div className="relative w-[768px] h-[1365px]">
    <img
      src="/bestconcertdownloadimage.png"
      alt="Poster Background"
      className="w-full h-full object-cover"
      crossOrigin="anonymous"
    />

   {/* Prompt Styled Like Yesterday's Winning Lineup */}
{dailyPrompt && (
  <div className="absolute top-[140px] left-1/2 transform -translate-x-1/2 rotate-[-2deg]">
    <div className="text-center text-red-500 text-lg font-bold uppercase border-2 border-red-500 px-6 py-2 tracking-wider whitespace-nowrap bg-black">
      {dailyPrompt}
    </div>
  </div>
)}


    <div className="absolute bottom-24 w-full flex flex-col items-center gap-6 px-4">
      <div className="w-40 h-40 rounded-2xl border border-red-600 overflow-hidden shadow-xl">
        {headliner?.image && (
          <img
            src={headliner.image}
            alt={headliner.name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        )}
      </div>

      <div className="flex gap-4">
        {[opener, secondOpener].map((artist, idx) => (
          <div key={idx} className="w-32 h-32 rounded-2xl border border-red-600 overflow-hidden shadow-md">
            {artist?.image && (
              <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
{showEmailSignup && (
  <div className="fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
    <div className="bg-[#fdf6e3] text-black p-6 rounded-2xl w-[90%] max-w-sm text-left relative shadow-2xl border-[6px] border-black border-double">
      <button
        onClick={() => setShowEmailSignup(false)}
        className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-black"
      >
        &times;
      </button>
      <h2 className="text-2xl font-bold mb-4">Get Daily Prompts & Winners</h2>
      {emailSubmitted ? (
        <p className="text-green-600 font-semibold">Thanks for subscribing! 🎉</p>
      ) : (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-black rounded-md mb-4"
          />
          <button
            onClick={handleEmailSignup}
            className="w-full bg-black text-yellow-300 py-2 rounded-full font-bold hover:bg-yellow-300 hover:text-black transition"
          >
            Subscribe
          </button>
        </>
      )}
    </div>
  </div>
)}

      {/* YOUR GREATEST HITS SECTION */}
      <div className="mt-12 flex justify-center items-center w-full">
        <div className="relative w-full max-w-md text-center">
          <div className="absolute inset-0 -z-10 rounded-xl border-2 border-green-400 animate-pulse"></div>
          <div className="relative bg-black rounded-xl p-6 border-2 border-green-400">
            <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 text-green-400 drop-shadow-[0_0_12px_green]">
              Your Greatest Hits
            </h2>
            <ul className="flex flex-col gap-4 items-center text-white">
  <li className="text-sm">🎤 Promoted Lineups (So Far): <span className="font-bold">{submittedCount ?? "--"}</span></li>
  <li className="text-sm">🏆 Lineups That Made the Top 10: <span className="font-bold">{topTenCount ?? "--"}</span></li>
  <li className="text-sm">🥇 Lineups That Won It All: <span className="font-bold">{winningCount ?? "--"}</span></li>
  <li className="text-sm">🤝 Winning Assists: <span className="font-bold">{winningAssistsCount ?? "--"}</span></li>
  <li className="text-sm">📆 Longest Daily Streak: <span className="font-bold">{longestStreak ?? "--"}</span></li>
</ul>

            <div className="mt-6">
  <h3 className="text-green-300 font-bold mb-2 text-lg">🔥 Most Voted Lineup</h3>
  {mostVotedLineup ? (
    <>
      <div className="flex justify-center gap-4">
        {[mostVotedLineup.opener, mostVotedLineup.second_opener, mostVotedLineup.headliner].map((artist, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <img
              src={artist?.image || "/placeholder.jpg"}
              alt={artist?.name || "Artist"}
              className="w-20 h-20 rounded-md object-cover border border-green-400 mb-1"
            />
            <span className="text-xs font-bold">{artist?.name || "Artist"}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-green-400">🔥 <span className="font-bold">{mostVotedLineup.votes ?? 0}</span> votes</p>
    </>
  ) : (
    <p className="text-sm text-green-400">No votes yet.</p>
  )}
</div>
      </div>
      </div>
    </div>
  </div>
  </div>
); 
}
