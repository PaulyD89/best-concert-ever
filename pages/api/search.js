let accessToken = null;
let expiresAt = 0;

async function getAccessToken() {
  if (!accessToken || Date.now() > expiresAt) {
    const res = await fetch('http://localhost:3000/api/token');
    const data = await res.json();
    accessToken = data.access_token;
    expiresAt = Date.now() + data.expires_in * 1000;
  }
  return accessToken;
}

export default async function handler(req, res) {
  const { q } = req.query;
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
}
