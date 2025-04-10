// pages/api/search.js

let accessToken = null;
let expiresAt = 0;

async function getAccessToken() {
  if (!accessToken || Date.now() > expiresAt) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
    expiresAt = Date.now() + tokenData.expires_in * 1000;
  }

  return accessToken;
}

export default async function handler(req, res) {
  const { q } = req.query;

  try {
    const token = await getAccessToken();

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=artist&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await searchRes.json();
    res.status(200).json(data.artists.items);
  } catch (err) {
    console.error("Spotify Search Error:", err);
    res.status(500).json({ error: "Failed to fetch from Spotify" });
  }
}
