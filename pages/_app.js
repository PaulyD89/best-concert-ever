// pages/_app.js
import '@/styles/globals.css'; // or wherever your global styles are

export default function App({ Component, pageProps }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1 }}>
        <Component {...pageProps} />
      </main>
      <footer style={{ padding: '1rem', fontSize: '0.8rem', color: '#888' }}>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <a
        href="https://instagram.com/bestconcertevergame"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.75 2h8.5A5.76 5.76 0 0122 7.75v8.5A5.76 5.76 0 0116.25 22h-8.5A5.76 5.76 0 012 16.25v-8.5A5.76 5.76 0 017.75 2zm0 2A3.75 3.75 0 004 7.75v8.5A3.75 3.75 0 007.75 20h8.5A3.75 3.75 0 0020 16.25v-8.5A3.75 3.75 0 0016.25 4h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm4.75-.9a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2z"/>
        </svg>
      </a>

      <span>© {new Date().getFullYear()} Thirty Bucks, Inc. All rights reserved.</span>

      <a
        href="https://twitter.com/bestconcertgame"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.46 6c-.77.35-1.6.59-2.47.69a4.26 4.26 0 001.86-2.36 8.48 8.48 0 01-2.7 1.03 4.23 4.23 0 00-7.3 3.86A12 12 0 013 4.89a4.22 4.22 0 001.31 5.64 4.21 4.21 0 01-1.91-.53v.05a4.24 4.24 0 003.4 4.14 4.3 4.3 0 01-1.9.07 4.25 4.25 0 003.96 2.95A8.5 8.5 0 012 19.54a12 12 0 006.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.35-.02-.53A8.35 8.35 0 0024 5.6a8.4 8.4 0 01-2.54.7z"/>
        </svg>
      </a>
    </div>
    
    <a
      href="/press-room"
      style={{ 
        color: '#888', 
        textDecoration: 'none',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        transition: 'color 0.2s'
      }}
      onMouseEnter={(e) => e.target.style.color = '#facc15'}
      onMouseLeave={(e) => e.target.style.color = '#888'}
    >
      Press Room
    </a>
  </div>
</footer>
    </div>
  );
}