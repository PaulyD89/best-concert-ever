import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta property="og:title" content="Best. Concert. Ever." />
        <meta property="og:description" content="Assemble the ultimate concert lineup!" />
        <meta property="og:image" content="https://bestconcertevergame.com/social-preview.jpg" />
        <meta property="og:url" content="https://bestconcertevergame.com" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best. Concert. Ever." />
        <meta name="twitter:description" content="Play the daily concert lineup game!" />
        <meta name="twitter:image" content="https://bestconcertevergame.com/social-preview.jpg" />

        <script
          defer
          data-domain="bestconcertevergame.com"
          src="https://plausible.io/js/script.js"
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
