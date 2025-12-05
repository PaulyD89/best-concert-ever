export default async function handler(req, res) {
  const { prompt, market } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Determine language for the hint based on market
  let language = "English";
  if (market === 'MX') language = "Spanish";
  if (market === 'BR') language = "Portuguese";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `You are helping users understand a music concert theme. The theme is: "${prompt}"

Please provide 4-5 well-known artist or band names that would fit this theme perfectly. 

Important rules:
- Respond ONLY with artist names separated by commas
- Use ${language} if translating band names is appropriate
- No explanations, no extra text, just the names
- Choose popular, recognizable artists that clearly fit the theme

Example format: "Artist One, Artist Two, Artist Three, Artist Four, Artist Five"`
          }
        ],
      }),
    });

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].text) {
      const hint = data.content[0].text.trim();
      return res.status(200).json({ hint });
    } else {
      throw new Error("Invalid response from Claude API");
    }
    
  } catch (error) {
    console.error("Error generating hint:", error);
    
    // Fallback hints by market
    let fallbackHint = "Try searching for popular artists in this genre on Spotify!";
    if (market === 'MX') fallbackHint = "¡Intenta buscar artistas populares de este género en Spotify!";
    if (market === 'BR') fallbackHint = "Tente procurar artistas populares deste gênero no Spotify!";
    
    return res.status(200).json({ hint: fallbackHint });
  }
}