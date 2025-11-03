import React from "react";
import Link from "next/link";

export default function PressRoom() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white font-sans">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-400 mb-4 tracking-tight">
            Press Room
          </h1>
          <p className="text-xl text-gray-300">
            Media inquiries and press releases
          </p>
        </div>

        {/* Back to Game Link */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <span>&larr;</span>
            <span>Back to Game</span>
          </Link>
        </div>

        {/* Latest Press Release Section */}
        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-yellow-400/30 rounded-xl p-8 mb-8 backdrop-blur-sm">
          <div className="border-b border-yellow-400/30 pb-4 mb-6">
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">
              Latest Press Release
            </h2>
            <p className="text-sm text-gray-400">
              November 3, 2025
            </p>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">For Immediate Release</p>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Best. Concert. Ever. Partners with Soundcharts to Launch "Decibel Level™," a Data-Driven Evolution of the Fantasy Concert Game
            </h3>
            
            <p className="text-sm text-gray-400 mb-6">
              <strong>Los Angeles, CA — November 3, 2025</strong>
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              Best Concert Ever, the daily fantasy concert game that lets fans play promoter by building dream lineups around themed challenges, has announced a new partnership with global music intelligence platform Soundcharts. Leveraging their robust music industry data, Best Concert Ever has developed The Decibel Level™ — a groundbreaking new feature that uses real-time music industry data to give each lineup an official &ldquo;buzz score.&rdquo;
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              The Decibel Level analyzes a range of verified music industry metrics, including an artist's streaming and social media followers, trending track growth, streaming music platform popularity, radio airplay and more. Such trending global data is combined with a proprietary algorithm to create Best Concert Ever's Decibel Level™ score each and every player's daily concert lineup across their Opener, 2nd Opener, and Headliner.
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed italic">
              &ldquo;Best Concert Ever is making music fandom strategic,&rdquo; said Aël Guégan, Head of Partnerships at Soundcharts. &ldquo;We&rsquo;re proud to supply the data behind the Decibel Level™, ensuring every lineup reflects real-world momentum.&rdquo;
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              The higher a lineup&rsquo;s Decibel Level, the more bonus votes it earns Best Concert Ever&rsquo;s aspiring music promoters when submitted — rewarding users who not only curate inspired lineups but also keep a pulse on what&rsquo;s trending in music. This is all in service of players&rsquo; quest to have their unique lineups chart in the game&rsquo;s daily top ten, ultimately win as the day&rsquo;s &ldquo;best concert ever&rdquo; and unlock badges, rewards and help them ascend the global charts.
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed italic">
              &ldquo;The Decibel Level takes Best Concert Ever to the next stage,&rdquo; said Paul Davidson, Co-Creator and CEO of Best Concert Ever. &ldquo;By partnering with Soundcharts, we&rsquo;re connecting the creative instinct of music fandom with real-time industry analytics. It&rsquo;s a fun, data-driven way to measure how much heat your lineup truly has.&rdquo;
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed italic">
              &ldquo;When it comes to their favorite bands, music lovers are diehards. Their intense fandom powers the entire recording industry. But to win this game, you need to be more than just a fan. You need to be strategic with the lineups you promote,&rdquo; added Ben Raab, Co-Creator and President of Best Concert Ever. &ldquo;Now, our global community of players can crank their gaming to 11 and increase their chances of success with Best Concert Ever&rsquo;s all-new dB Level feature.&rdquo;
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              Since its launch in May 2025, Best Concert Ever has built a passionate daily community of hundreds of thousands of fans assembling dream lineups across decades and genres. As the game has grown, Best Concert Ever has partnered with music labels and live event companies to provide players with incentives for winning. Most recently, the game partnered with Ultra Records and Sony Music to help promote The Midnight&rsquo;s latest album &ldquo;Syndicate&rdquo; and saw the passionate fan base rally around the game. Now, with the Soundcharts integration, the game&rsquo;s next chapter in its evolution is merging fans&rsquo; cultural passion with data-driven insight in a way no other music experience has before.
            </p>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Fans can play, track their Decibel Levels, and compete for the day's top lineup at{" "}
              <a href="https://www.bestconcertevergame.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                www.bestconcertevergame.com
              </a>
              .
            </p>
            
            <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-8">
              ABOUT SOUNDCHARTS
            </h4>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Soundcharts is a global music intelligence platform used by music industry businesses to track artists and releases in real time. Through a developer-friendly API and web tools, Soundcharts aggregates metrics across streaming and social platforms, playlist placements, and radio airplay to surface what's trending and why. Teams rely on Soundcharts to monitor momentum, benchmark performance, and power products and experiences with music data - like the Decibel Level™ in Best Concert Ever. Learn more at{" "}
              <a href="https://soundcharts.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                soundcharts.com
              </a>
              .
            </p>
            
            <h4 className="text-xl font-bold text-yellow-400 mb-3">
              ABOUT BEST CONCERT EVER
            </h4>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Best Concert Ever is the daily fantasy concert game that gamifies music fandom. Each day, players step into the role of concert promoters, building dream lineups of an Opener, 2nd Opener, and Headliner around a themed challenge — from &ldquo;Best 2000s Indie Night&rdquo; to &ldquo;Best Red Rocks Lineup.&rdquo; Powered by Spotify and integrated with real-time music data, the game lets fans discover artists, compete for votes, and climb the leaderboards to have their lineup crowned the day&rsquo;s Best Concert Ever. Co-created by Paul Davidson and Ben Raab, the platform has partnered with major labels and artists to promote new releases and live events while sourcing valuable insights from the global music fan community. By blending data, creativity, and competition, Best Concert Ever is redefining how fans engage with the artists they love. Play daily at{" "}
              <a href="https://www.bestconcertevergame.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                www.bestconcertevergame.com
              </a>
              .
            </p>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-yellow-400/30 rounded-xl p-8 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-yellow-400/30 pb-4">
            Media Contact
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Publicist Information
              </h3>
              <div className="text-gray-300 space-y-2">
                <p>
                  <span className="text-yellow-400 font-semibold">Name:</span> Austin Poillard
                </p>
                <p>
                  <span className="text-yellow-400 font-semibold">Email:</span>{" "}
                  <a href="mailto:apoillard@plhpr.com" className="hover:text-yellow-400 transition-colors">
                    apoillard@plhpr.com
                  </a>
                </p>
                <p>
                  <span className="text-yellow-400 font-semibold">Phone:</span> [Phone Number]
                </p>
                <p>
                  <span className="text-yellow-400 font-semibold">Agency:</span> PLH Public Relations
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-yellow-400/20">
              <h3 className="text-lg font-semibold text-white mb-2">
                For Press Inquiries
              </h3>
              <p className="text-gray-300 leading-relaxed">
                For interview requests, press kits, high-resolution images, or additional information about Best Concert Ever, please contact us using the information above. We typically respond within 24-48 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Resources Section (Optional) */}
        <div className="mt-8 bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-yellow-400/30 rounded-xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            Press Resources
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">&bull;</span>
              <span>High-resolution logos and images available upon request</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">&bull;</span>
              <span>Founder interviews can be scheduled via email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">&bull;</span>
              <span>Product screenshots and demo access available</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>&copy; 2025 Best Concert Ever. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}