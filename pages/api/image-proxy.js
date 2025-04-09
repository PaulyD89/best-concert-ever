// pages/api/image-proxy.js

export default async function handler(req, res) {
    const { url } = req.query;
  
    if (!url) {
      return res.status(400).json({ error: "Missing image URL" });
    }
  
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        return res.status(500).json({ error: "Failed to fetch image" });
      }
  
      const contentType = response.headers.get("content-type");
      const buffer = await response.arrayBuffer();
  
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");
  
      res.status(200).send(Buffer.from(buffer));
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Proxy failed" });
    }
  }
  