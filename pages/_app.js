// pages/_app.js
import '@/styles/globals.css'; // or wherever your global styles are

export default function App({ Component, pageProps }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1 }}>
        <Component {...pageProps} />
      </main>
      <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.9rem', color: '#888' }}>
        © {new Date().getFullYear()} Thirty Bucks, LLC. All rights reserved.
      </footer>
    </div>
  );
}
