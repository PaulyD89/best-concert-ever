import Head from "next/head";

export default function BestConcertEver() {
  return (
    <>
      <Head>
        <title>Best. Concert. Ever. — On Hiatus</title>
        <meta
          name="description"
          content="Best. Concert. Ever. is on hiatus. We'll be back once our concert promoters have secured the next road trip."
        />
      </Head>
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
        <img
          src="/hiatus.png"
          alt="Best. Concert. Ever. is now on hiatus from its year long tour. We'll be back once our concert promoters have secured the next road trip. Until then, thanks to everyone who has played!"
          className="max-w-md w-full h-auto"
        />
      </main>
    </>
  );
}