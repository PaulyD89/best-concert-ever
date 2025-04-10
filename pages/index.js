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
  "Best World Music Lineups"
  // ... You can add up to 1000+ prompts here
];

function getDailyPrompt() {
  // Convert to Pacific Time (automatically handles PST/PDT)
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

const dailyPrompt = getDailyPrompt();

function getYesterdayPrompt() {
  const now = new Date();
  const pacificDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  pacificDate.setDate(pacificDate.getDate() - 1); // one day before
  const yesterday = pacificDate.toISOString().split("T")[0];

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
              onSelect({ name: artist.name, image: artist.images?.[0]?.url });
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
  const flyerRef = React.useRef(null);
  const downloadRef = React.useRef(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  // removed duplicate state declarations for headliner, opener, secondOpener, and submitted
  const [lineups, setLineups] = useState([]);
  const [yesterdaysWinner, setYesterdaysWinner] = useState(null);


  useEffect(() => {
    const fetchTopLineups = async () => {
    const { data, error } = await supabase
      .from("lineups")
      .select("headliner, opener, second_opener")
      .eq("prompt", dailyPrompt);

    if (!error && data) {
      const countMap = {};

      data.forEach((lineup) => {
        const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
        countMap[key] = (countMap[key] || 0) + 1;
      });

      const sortedLineups = Object.entries(countMap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
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
  }, []);

  useEffect(() => {
    const fetchYesterdaysWinner = async () => {
      const { data, error } = await supabase
        .from("lineups")
        .select("headliner, opener, second_opener")
        .eq("prompt", yesterdayPrompt);
  
      if (error || !data) return;
  
      const countMap = {};
  
      data.forEach((lineup) => {
        const key = `${lineup.headliner?.name}|||${lineup.opener?.name}|||${lineup.second_opener?.name}`;
        countMap[key] = (countMap[key] || 0) + 1;
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
      const { error } = await supabase.from("lineups").insert([
        {
          prompt: dailyPrompt,
          headliner,
          opener,
          second_opener: secondOpener,
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
              <li>Time to flex those Music Promoter skills and show everyone you know how to put together the ultimate concert lineup.</li>
              <li>First, check out the daily prompt (80s bands, Music Duos) and rack your brain for the best bands or music artists that fit the bill.</li>
              <li>Pick an Opener, a Second Opener and the ultimate Headliner for your show.</li>
              <li>Use the search boxes to select real artists from Spotify, then lock them in for good.</li>
              <li>Note: you can&apos;t use the same artist more than once, and dead rock stars are more than fair game.</li>
              <li>Download your <b>Best Concert Ever</b> and share on social, then come back tomorrow to see which lineup was the most popular!</li>
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
          <img src="/logo.png" alt="Best Concert Ever Logo" className="w-full h-full object-cover" crossOrigin="anonymous" />
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

        // Open image in new tab instead of prompting to download
        const imageURL = canvas.toDataURL("image/jpeg", 0.95);
        const newTab = window.open();
        newTab.document.write(`<img src='${imageURL}' style='width:100%' />`);
        newTab.document.title = "Best Concert Ever";
      } catch (err) {
        console.error("Image open failed:", err);
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
      
  <div className="mt-2 mb-8 text-sm text-gray-300 underline cursor-pointer hover:text-white" onClick={() => setShowHowToPlay(true)}>
        How to Play
      </div>

      <div className="mt-12 flex justify-center items-center w-full">
        <div className="relative w-full max-w-md text-center">
          <div className="absolute inset-0 rounded-xl border-2 border-yellow-400 animate-pulse pointer-events-none"></div>
          <div className="relative bg-black rounded-xl p-6 border-2 border-yellow-400">
            <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 text-yellow-400 drop-shadow-[0_0_12px_yellow]">
              Today&apos;s Top 5
            </h2>
            <ul className="flex flex-col gap-2 items-center">
              {lineups.map((lineup, idx) => (
                <li key={idx} className="text-white">
                  {lineup.headliner?.name} / {lineup.opener?.name} / {lineup.second_opener?.name}
                </li>
              ))}
            </ul>
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
                {[yesterdaysWinner.headliner, yesterdaysWinner.opener, yesterdaysWinner.second_opener].map((artist, idx) => (
                  <li key={idx} className="text-white flex flex-col items-center">
                    <div className="group">
                      <a href={artist?.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={artist?.image}
                          alt={artist?.name}
                          className="w-24 h-24 rounded-full mb-2 object-cover border-2 border-red-400 shadow-[0_0_8px_#f87171] group-hover:scale-105 transition-transform duration-200"
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
</div>
</div>
  );
}
