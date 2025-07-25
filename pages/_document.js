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
              fbq('init', '1067195892216515');
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
