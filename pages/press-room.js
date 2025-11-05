import React from "react";
import Link from "next/link";

export default function PressRoom() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1e1e1e] text-white font-sans">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="https://www.bestconcertevergame.com/yellow-top-badge.png" 
            alt="Best Concert Ever Logo" 
            className="w-32 h-32 mx-auto"
          />
        </div>
        
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

        {/* Press Releases Section */}
        <div className="space-y-8">
          {/* Latest Press Release - November 5, 2025 */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-yellow-400/30 rounded-xl p-8 backdrop-blur-sm">
            <div className="border-b border-yellow-400/30 pb-4 mb-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                Latest Press Release
              </h2>
              <p className="text-sm text-gray-400">
                November 5, 2025
              </p>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">For Immediate Release</p>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                Best Concert Ever™ Turns Up the Volume with All-New Game Features: Decibel Level™, Badges, and Leaderboards
              </h3>
              
              <p className="text-sm text-gray-400 mb-6">
                <strong>Los Angeles, CA - November 5, 2025</strong>
              </p>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                Best Concert Ever™, the daily fantasy concert game where music fans build dream lineups and compete for votes, has just rolled out its biggest feature update yet. The new tools deepen the gameplay experience, enhance competition, and reward music fandom like never before.
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                Introducing Decibel Level™
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Every lineup submission now earns a Decibel Level™, a real-time score from 1-100 powered by live music industry data. Pulling from streaming numbers, radio airplay, social followers, and more, each lineup receives a unique performance rating. The higher your Decibel Level, the more extra votes your lineup gets. It&apos;s the next evolution of how Best Concert Ever™ connects music data to fan creativity.
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                Earn Decibel Level™ Badges
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The game now tracks each player&apos;s highest Decibel Level - visible anytime in Your Greatest Hits. Players climbing the Weekly or Monthly Leaderboards will also see special Decibel Level Badges, celebrating their performance and status as top Promoters in the community.
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                Weekly & Monthly Leaderboards
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Competition just got louder. Fans can now view Top Promoters across both 7-day (Weekly) and 30-day (Monthly) periods. Each leaderboard features clickable Promoter nicknames that reveal personal stats, badges, and achievements - encouraging friendly rivalries and community engagement. (Pro tip: choose your Nickname in the game to make sure you&apos;re seen on the charts!)
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                More on the Horizon
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                This update marks the beginning of a new era for Best Concert Ever™, with even more features, collaborations, and giveaways coming soon. The game also teased a special Month of December event, where top-performing Promoters can win cold, hard cash for their musical mastery.
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-8">
                About Best Concert Ever™
              </h4>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Best Concert Ever™ is a free daily fantasy concert game where music fans become promoters, building dream lineups of three artists around each day&apos;s creative prompt. Players vote, share, and compete to climb the charts - earning badges, streaks, and bragging rights along the way. Powered by real music data and a global fanbase, Best Concert Ever™ is changing the way fans play with music.
              </p>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                Play now at:{&quot; &quot;}
                <a href="https://www.bestconcertevergame.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  www.bestconcertevergame.com
                </a>
              </p>
            </div>
          </div>

          {/* Previous Press Release - November 3, 2025 */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-yellow-400/30 rounded-xl p-8 backdrop-blur-sm">
            <div className="border-b border-yellow-400/30 pb-4 mb-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                Previous Press Release
              </h2>
              <p className="text-sm text-gray-400">
                November 3, 2025
              </p>
            </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">For Immediate Release</p>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Best. Concert. Ever. Partners with Soundcharts to Launch &quot;Decibel Level™,&quot; a Data-Driven Evolution of the Fantasy Concert Game
            </h3>
            
            <p className="text-sm text-gray-400 mb-6">
              <strong>Los Angeles, CA - November 3, 2025</strong>
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              Best. Concert. Ever., the daily fantasy concert game that lets fans play promoter by building dream lineups around themed challenges, has announced a new partnership with global music intelligence platform Soundcharts. Leveraging their robust music industry data, Best. Concert. Ever. has developed The Decibel Level™ - a groundbreaking new feature that uses real-time music industry data to give each lineup an official &quot;buzz score.&quot;
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              The Decibel Level analyzes a range of verified music industry metrics, including an artist&apos;s streaming and social media followers, trending track growth, streaming music platform popularity, radio airplay and more. Such trending global data is combined with a proprietary algorithm to create Best. Concert. Ever.&apos;s Decibel Level™ score benefitting each and every player&apos;s daily concert lineup across their Opener, 2nd Opener, and Headliner.
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed italic">
              &quot;Best. Concert. Ever. is making music fandom strategic,&quot; said Aël Guégan, Head of Partnerships at Soundcharts. &quot;We&apos;re proud to supply the data behind the Decibel Level™, ensuring every lineup reflects real-world momentum.&quot;
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              The higher a lineup&apos;s Decibel Level, the more bonus votes it earns Best. Concert. Ever.&apos;s aspiring music promoters when submitted - rewarding users who not only curate inspired lineups but also keep a pulse on what&apos;s trending in music. This is all in service of players&apos; quest to have their unique lineups chart in the game&apos;s daily top ten, ultimately win as the day&apos;s &quot;best concert ever&quot; and unlock badges, rewards and help them ascend the global charts.
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed italic">
              &quot;The Decibel Level takes Best. Concert. Ever. to the next stage,&quot; said Paul Davidson, Co-Creator and CEO of Best Concert Ever. &quot;By partnering with Soundcharts, we&apos;re connecting the creative instinct of music fandom with real-time industry analytics. It&apos;s a fun, data-driven way to measure how much heat your lineup truly has.&quot;
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed italic">
              &quot;When it comes to their favorite bands, music lovers are diehards. Their intense fandom powers the entire recording industry. But to win this game, you need to be more than just a fan. You need to be strategic with the lineups you promote,&quot; added Ben Raab, Co-Creator and President of Best Concert Ever. &quot;Now, our global community of players can crank their gaming to 11 and increase their chances of success with Best. Concert. Ever.&apos;s all-new dB Level feature.&quot;
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              Since its launch in May 2025, Best. Concert. Ever. has built a passionate daily community of hundreds of thousands of fans assembling dream lineups across decades and genres. As the game has grown, Best Concert Ever has partnered with music labels and live event companies to provide players with incentives for winning. Most recently, the game partnered with Ultra Records and Sony Music to help promote The Midnight&apos;s latest album &quot;Syndicate&quot; and saw the passionate fan base rally around the game. Now, with the Soundcharts integration, the game&apos;s next chapter in its evolution is merging fans&apos; cultural passion with data-driven insight in a way no other music experience has before.
            </p>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Fans can play, track their Decibel Levels, and compete for the day&apos;s top lineup at{&quot; &quot;}
              <a href="https://www.bestconcertevergame.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                www.bestconcertevergame.com
              </a>
              .
            </p>
            
            <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-8">
              ABOUT SOUNDCHARTS
            </h4>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Soundcharts is a global music intelligence platform used by music industry businesses to track artists and releases in real time. Through a developer-friendly API and web tools, Soundcharts aggregates metrics across streaming and social platforms, playlist placements, and radio airplay to surface what&apos;s trending and why. Teams rely on Soundcharts to monitor momentum, benchmark performance, and power products and experiences with music data - like the Decibel Level™ in Best Concert Ever. Learn more at{&quot; &quot;}
              <a href="https://soundcharts.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                soundcharts.com
              </a>
              .
            </p>
            
            <h4 className="text-xl font-bold text-yellow-400 mb-3">
              ABOUT BEST CONCERT EVER
            </h4>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Best Concert Ever is the daily fantasy concert game that gamifies music fandom. Each day, players step into the role of concert promoters, building dream lineups of an Opener, 2nd Opener, and Headliner around a themed challenge - from &quot;Best 2000s Indie Night&quot; to &quot;Best Red Rocks Lineup.&quot; Powered by Spotify and integrated with real-time music data, the game lets fans discover artists, compete for votes, and climb the leaderboards to have their lineup crowned the day&apos;s Best Concert Ever. Co-created by Paul Davidson and Ben Raab, the platform has partnered with major labels and artists to promote new releases and live events while sourcing valuable insights from the global music fan community. By blending data, creativity, and competition, Best Concert Ever is redefining how fans engage with the artists they love. Play daily at{&quot; &quot;}
              <a href="https://www.bestconcertevergame.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                www.bestconcertevergame.com
              </a>
              .
            </p>
          </div>
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
      </div>
    </div>
  );
}