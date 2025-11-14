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
          {/* Latest Press Release - November 18, 2025 - Mexico Launch */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-yellow-400/30 rounded-xl p-8 backdrop-blur-sm">
            <div className="border-b border-yellow-400/30 pb-4 mb-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                Latest Press Release
              </h2>
              <p className="text-sm text-gray-400">
                November 18, 2025
              </p>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">For Immediate Release</p>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                Best. Concert. Ever. Launches Beta Version in Mexico, Expanding Global Music Gaming Platform with Localized Experience
              </h3>
              
              <p className="text-sm text-gray-400 mb-6">
                <strong>Los Angeles, CA / Ciudad de México - November 18, 2025</strong>
              </p>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                Best. Concert. Ever., the daily fantasy concert game where music fans become promoters by building dream lineups and competing for votes, today announced the launch of its beta version in Mexico. The expansion delivers a fully localized Spanish-language experience to one of the world's most passionate music markets, complete with Mexican-specific daily prompts, leaderboards, and the game's signature Decibel Level™ scoring system powered by Soundcharts.
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                A Native Experience for Mexican Music Fans
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The Mexico beta features complete Spanish localization across every aspect of gameplay - from daily prompts and artist selection to voting, sharing, and leaderboard competition. Mexican players will receive unique daily challenges tailored to regional music culture, allowing them to showcase their knowledge of everything from Latin rock legends to contemporary regional Mexican artists alongside global superstars.
              </p>
              
              <p className="text-gray-300 mb-4 leading-relaxed italic">
                "Mexico has one of the most vibrant and diverse music cultures in the world," said <strong>Paul Davidson, CEO and Co-Creator of Best. Concert. Ever.</strong> "Our fans there deserve an experience that speaks directly to them - not just in language, but in the artists they're passionate about and the concerts they dream of promoting. This beta is our commitment to building a truly global community of music lovers who can compete, share, and celebrate the universal language of live music."
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                Soundcharts Partnership Expands to Mexico
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Best. Concert. Ever.'s partnership with global music intelligence platform Soundcharts now extends to the Mexican market, ensuring that the Decibel Level™ feature - which awards bonus votes based on real-time streaming data, radio airplay, social media momentum, and playlist performance - accurately reflects music trends across Mexico's dynamic landscape.
              </p>
              
              <p className="text-gray-300 mb-4 leading-relaxed italic">
                "The expansion into Mexico represents an exciting evolution for Best. Concert. Ever.," said <strong>Ben Raab, President and Co-Creator of Best. Concert. Ever.</strong> "Now, Mexican music lovers can compete on their own leaderboards, build lineups that reflect their unique musical perspective, and use the Decibel Level to maximize their chances of winning. The future of music gaming is global, and Mexico is an integral part of that vision."
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                Features Available in Mexico Beta:
              </h4>
              <ul className="text-gray-300 space-y-2 mb-4 list-disc pl-6">
                <li><strong>Fully Localized Spanish Interface</strong> - Every button, message, and instruction in native Spanish</li>
                <li><strong>Mexican Daily Prompts</strong> - Region-specific themed challenges celebrating Mexican and Latin music culture</li>
                <li><strong>Decibel Level™ Scoring</strong> - Soundcharts-powered data analytics tracking Mexican music trends</li>
                <li><strong>Dedicated Leaderboards</strong> - Weekly and Monthly rankings for Mexican Promoters</li>
                <li><strong>Badge & Reward System</strong> - Unlock achievements for winning lineups and maintaining streaks</li>
                <li><strong>Social Sharing</strong> - Share lineups and compete with friends across social platforms</li>
              </ul>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                About the Game
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Players select an Opener, 2nd Opener, and Headliner from any artist on Spotify to match daily themed prompts. Each lineup receives a Decibel Level score (1-100) that grants bonus votes based on current industry buzz. The most-voted lineups win the day, earning players badges, climbing global rankings, and cementing their status as elite music Promoters.
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                Availability
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The Mexico beta is now live at <strong>www.bestconcertevergame.com</strong>. The game automatically detects player location and delivers the appropriate market experience. Mexican players can start building lineups, earning Decibel scores, and competing immediately.
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-8">
                About Best. Concert. Ever.
              </h4>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Best. Concert. Ever. is the daily fantasy concert game that gamifies music fandom. Each day, players step into the role of concert promoters, building dream lineups of an Opener, 2nd Opener, and Headliner around a themed challenge. Powered by Spotify and integrated with real-time music data from Soundcharts, the game lets fans discover artists, compete for votes, and climb the leaderboards to have their lineup crowned the day's Best. Concert. Ever. Co-created by Paul Davidson and Ben Raab, the platform has partnered with major labels including Sony Music and Ultra Records to promote new releases and live events while sourcing valuable insights from the global music fan community. By blending data, creativity, and competition, Best. Concert. Ever. is redefining how fans engage with the artists they love.
              </p>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                Play daily at:{" "}
                <a href="https://www.bestconcertevergame.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  www.bestconcertevergame.com
                </a>
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                About Soundcharts
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Soundcharts is a global music intelligence platform used by music industry businesses to track artists and releases in real time. Through a developer-friendly API and web tools, Soundcharts aggregates metrics across streaming and social platforms, playlist placements, and radio airplay to surface what's trending and why. Teams rely on Soundcharts to monitor momentum, benchmark performance, and power products and experiences with music data - like the Decibel Level™ in Best. Concert. Ever. Learn more at soundcharts.com.
              </p>
            </div>
          </div>

          {/* Previous Press Release - November 5, 2025 */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-yellow-400/30 rounded-xl p-8 backdrop-blur-sm">
            <div className="border-b border-yellow-400/30 pb-4 mb-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                Previous Press Release
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
                Every lineup submission now earns a Decibel Level™, a real-time score from 1-100 powered by live music industry data. Pulling from streaming numbers, radio airplay, social followers, and more, each lineup receives a unique performance rating. The higher your Decibel Level, the more extra votes your lineup gets. It's the next evolution of how Best Concert Ever™ connects music data to fan creativity.
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                Earn Decibel Level™ Badges
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The game now tracks each player's highest Decibel Level - visible anytime in Your Greatest Hits. Players climbing the Weekly or Monthly Leaderboards will also see special Decibel Level Badges, celebrating their performance and status as top Promoters in the community.
              </p>
              
              <h4 className="text-xl font-bold text-yellow-400 mb-3 mt-6">
                Weekly & Monthly Leaderboards
              </h4>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Competition just got louder. Fans can now view Top Promoters across both 7-day (Weekly) and 30-day (Monthly) periods. Each leaderboard features clickable Promoter nicknames that reveal personal stats, badges, and achievements - encouraging friendly rivalries and community engagement. (Pro tip: choose your Nickname in the game to make sure you're seen on the charts!)
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
                Best Concert Ever™ is a free daily fantasy concert game where music fans become promoters, building dream lineups of three artists around each day's creative prompt. Players vote, share, and compete to climb the charts - earning badges, streaks, and bragging rights along the way. Powered by real music data and a global fanbase, Best Concert Ever™ is changing the way fans play with music.
              </p>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                Play now at:{" "}
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
              Best. Concert. Ever. Partners with Soundcharts to Launch "Decibel Level™," a Data-Driven Evolution of the Fantasy Concert Game
            </h3>
            
            <p className="text-sm text-gray-400 mb-6">
              <strong>Los Angeles, CA - November 3, 2025</strong>
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              Best. Concert. Ever., the daily fantasy concert game that lets fans play promoter by building dream lineups around themed challenges, has announced a new partnership with global music intelligence platform Soundcharts. Leveraging their robust music industry data, Best. Concert. Ever. has developed The Decibel Level™ - a groundbreaking new feature that uses real-time music industry data to give each lineup an official "buzz score."
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              The Decibel Level analyzes a range of verified music industry metrics, including an artist's streaming and social media followers, trending track growth, streaming music platform popularity, radio airplay and more. Such trending global data is combined with a proprietary algorithm to create Best. Concert. Ever.'s Decibel Level™ score benefitting each and every player's daily concert lineup across their Opener, 2nd Opener, and Headliner.
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed italic">
              "Best. Concert. Ever. is making music fandom strategic," said Aël Guégan, Head of Partnerships at Soundcharts. "We're proud to supply the data behind the Decibel Level™, ensuring every lineup reflects real-world momentum."
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              The higher a lineup's Decibel Level, the more bonus votes it earns Best. Concert. Ever.'s aspiring music promoters when submitted - rewarding users who not only curate inspired lineups but also keep a pulse on what's trending in music. This is all in service of players' quest to have their unique lineups chart in the game's daily top ten, ultimately win as the day's "best concert ever" and unlock badges, rewards and help them ascend the global charts.
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed italic">
              "The Decibel Level takes Best. Concert. Ever. to the next stage," said Paul Davidson, Co-Creator and CEO of Best Concert Ever. "By partnering with Soundcharts, we're connecting the creative instinct of music fandom with real-time industry analytics. It's a fun, data-driven way to measure how much heat your lineup truly has."
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed italic">
              "When it comes to their favorite bands, music lovers are diehards. Their intense fandom powers the entire recording industry. But to win this game, you need to be more than just a fan. You need to be strategic with the lineups you promote," added Ben Raab, Co-Creator and President of Best Concert Ever. "Now, our global community of players can crank their gaming to 11 and increase their chances of success with Best. Concert. Ever.'s all-new dB Level feature."
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              Since its launch in May 2025, Best. Concert. Ever. has built a passionate daily community of hundreds of thousands of fans assembling dream lineups across decades and genres. As the game has grown, Best Concert Ever has partnered with music labels and live event companies to provide players with incentives for winning. Most recently, the game partnered with Ultra Records and Sony Music to help promote The Midnight's latest album "Syndicate" and saw the passionate fan base rally around the game. Now, with the Soundcharts integration, the game's next chapter in its evolution is merging fans' cultural passion with data-driven insight in a way no other music experience has before.
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
              Best Concert Ever is the daily fantasy concert game that gamifies music fandom. Each day, players step into the role of concert promoters, building dream lineups of an Opener, 2nd Opener, and Headliner around a themed challenge - from "Best 2000s Indie Night" to "Best Red Rocks Lineup." Powered by Spotify and integrated with real-time music data, the game lets fans discover artists, compete for votes, and climb the leaderboards to have their lineup crowned the day's Best Concert Ever. Co-created by Paul Davidson and Ben Raab, the platform has partnered with major labels and artists to promote new releases and live events while sourcing valuable insights from the global music fan community. By blending data, creativity, and competition, Best Concert Ever is redefining how fans engage with the artists they love. Play daily at{" "}
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