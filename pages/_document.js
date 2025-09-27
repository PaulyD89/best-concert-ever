import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Best Concert Ever – Your Dream Festival, Every Day</title> {/* ✅ Added title tag */}

        <meta property="og:title" content="Best. Concert. Ever." />
        <meta property="og:description" content="Assemble the ultimate concert lineup!" />
        <meta name="description" content="Create your dream concert lineup and compete with music fans daily in Best Concert Ever – the ultimate music game." />
        <meta property="og:image" content="https://bestconcertevergame.com/new-preview.jpg" />
        <meta property="og:url" content="https://bestconcertevergame.com" />
        <link rel="canonical" href="https://www.bestconcertevergame.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Best Concert Ever",
              url: "https://www.bestconcertevergame.com"
            })
          }}
        />

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

        {/* Meta Pixel Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '730735346260340');
              fbq('track', 'PageView');
            `,
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />

        {/* Meta Pixel noscript fallback */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `
              <img height="1" width="1" style="display:none"
              src="https://www.facebook.com/tr?id=1067195892216515&ev=PageView&noscript=1" />
            `,
          }}
        />
      </body>
    </Html>
  );
}
