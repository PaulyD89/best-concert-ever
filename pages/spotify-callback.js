import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SpotifyCallback() {
  const router = useRouter();

  useEffect(() => {
    // Get the access token from the URL hash
    const hash = window.location.hash;
    
    if (hash) {
      // Parse the hash to get token and expiry
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const expiresIn = params.get('expires_in');
      
      if (accessToken) {
        // Store token and expiry time
        localStorage.setItem('spotify_access_token', accessToken);
        const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);
        localStorage.setItem('spotify_token_expiry', expiryTime.toString());
        
        // Get the pending lineup data
        const pendingLineup = localStorage.getItem('pending_playlist_lineup');
        
        if (pendingLineup) {
          const lineup = JSON.parse(pendingLineup);
          
          // Create the playlist
          createPlaylistWithToken(accessToken, lineup);
          
          // Clean up
          localStorage.removeItem('pending_playlist_lineup');
        }
        
        // Redirect back to home
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    }
  }, [router]);

  async function createPlaylistWithToken(accessToken, lineup) {
    try {
      // Get user's Spotify ID
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const userData = await userResponse.json();
      
      // Create playlist
      const playlistName = `${lineup.prompt} - Best Concert Ever`;
      const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: playlistName,
          description: `${lineup.opener.name} → ${lineup.second_opener.name} → ${lineup.headliner.name}`,
          public: false
        })
      });
      const playlistData = await playlistResponse.json();
      
      // Get tracks for each artist in concert order
      let trackUris = [];
      
      // OPENER: 3 songs (least popular to most popular)
      const openerTracksResponse = await fetch(
        `https://api.spotify.com/v1/artists/${lineup.opener.spotifyId}/top-tracks?market=US`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const openerTracksData = await openerTracksResponse.json();
      const openerTracks = openerTracksData.tracks
        .slice(0, 3)
        .reverse()
        .map(t => t.uri);
      trackUris = trackUris.concat(openerTracks);
      
      // SECOND OPENER: 4 songs (least popular to most popular)
      const secondOpenerTracksResponse = await fetch(
        `https://api.spotify.com/v1/artists/${lineup.second_opener.spotifyId}/top-tracks?market=US`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const secondOpenerTracksData = await secondOpenerTracksResponse.json();
      const secondOpenerTracks = secondOpenerTracksData.tracks
        .slice(0, 4)
        .reverse()
        .map(t => t.uri);
      trackUris = trackUris.concat(secondOpenerTracks);
      
      // HEADLINER: 5 songs (least popular to most popular)
      const headlinerTracksResponse = await fetch(
        `https://api.spotify.com/v1/artists/${lineup.headliner.spotifyId}/top-tracks?market=US`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const headlinerTracksData = await headlinerTracksResponse.json();
      const headlinerTracks = headlinerTracksData.tracks
        .slice(0, 5)
        .reverse()
        .map(t => t.uri);
      trackUris = trackUris.concat(headlinerTracks);
      
      // Add tracks to playlist
      if (trackUris.length > 0) {
        await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uris: trackUris })
        });
      }
      
      // Open playlist in Spotify
      window.open(playlistData.external_urls.spotify, '_blank');
      
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Error creating playlist. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto animate-spin" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Creating Your Playlist...</h2>
        <p className="text-gray-400">Hang tight! We're building your concert lineup.</p>
      </div>
    </div>
  );
}