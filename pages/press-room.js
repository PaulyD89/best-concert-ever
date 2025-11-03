import React from "react";

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
          <a
            href="/"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <span>←</span>
            <span>Back to Game</span>
          </a>
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
            <h3 className="text-2xl font-bold text-white mb-4">
              [Press Release Title Here]
            </h3>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              [Your press release content goes here. Replace this text with your actual press release content, including all the details about your game, recent milestones, user statistics, or announcements you want to share with the media.]
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              [Add additional paragraphs as needed to fully communicate your news and story to journalists and media outlets.]
            </p>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              [Include quotes from founders, key team members, or partners to add credibility and human interest to your press release.]
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
                  <span className="text-yellow-400 font-semibold">Name:</span> [Publicist Name]
                </p>
                <p>
                  <span className="text-yellow-400 font-semibold">Email:</span>{" "}
                  <a href="mailto:press@example.com" className="hover:text-yellow-400 transition-colors">
                    press@example.com
                  </a>
                </p>
                <p>
                  <span className="text-yellow-400 font-semibold">Phone:</span> [Phone Number]
                </p>
                <p>
                  <span className="text-yellow-400 font-semibold">Agency:</span> [Agency Name, if applicable]
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
              <span className="text-yellow-400 mt-1">•</span>
              <span>High-resolution logos and images available upon request</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Founder interviews can be scheduled via email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Product screenshots and demo access available</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>© 2025 Best Concert Ever. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}