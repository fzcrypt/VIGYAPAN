import express from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import path from "path";

let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  console.warn("Could not initialize Gemini. Make sure GEMINI_API_KEY is set in .env.example");
}

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

app.use((req, res, next) => {
  if (req.url === '/api/debug') {
    return res.json({
       method: req.method,
       url: req.url,
       originalUrl: req.originalUrl,
       headers: req.headers
    });
  }
  next();
});

// Dummy Auth endpoints (for prototype)
app.post("/api/auth/register", (req, res) => {
  res.json({ token: "dummy-token", user: { name: req.body.name, email: req.body.email, credits: 0, plan: "free" } });
});

app.post("/api/auth/login", (req, res) => {
  res.json({ token: "dummy-token", user: { name: "User", email: req.body.email, credits: 0, plan: "free" } });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ name: "User", email: "user@example.com", credits: 0, plan: "free" });
});

app.post("/api/payment/create-order", (req, res) => {
  let amount = 99900; // default to 999 INR in paise
  if (req.body.plan === 'trial') amount = 100; // 1 INR in paise
  else if (req.body.plan === 'starter') amount = 99900;
  else if (req.body.plan === 'growth') amount = 349900;
  else if (req.body.plan === 'agency') amount = 999900;
  res.json({ keyId: "dummy-key", amount, orderId: "order_dummy" });
});

app.post("/api/payment/verify", (req, res) => {
  let creditsAdded = 30;
  if (req.body.plan === 'trial') creditsAdded = 10;
  else if (req.body.plan === 'starter') creditsAdded = 30;
  else if (req.body.plan === 'growth') creditsAdded = 150;
  else if (req.body.plan === 'agency') creditsAdded = 999;
  res.json({ success: true, creditsAdded, plan: req.body.plan });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { productName, productDesc, audience, language, tone, platform } = req.body;
    
    const prompt = `Act as an expert Indian copywriter and ad creator. 
You are creating an ad for a product/service. 
Product: ${productName}
Description: ${productDesc}
Target Audience: ${audience}
Platform: ${platform}
Tone: ${tone}
Language: ${language}

Create 4 different ad copies exactly matching the types below. 
Make sure the language is culturally appropriate for Indian audiences, using localized slang if applicable (especially in Hinglish or Hindi). 
Include emojis suited to the tone and platform.
Avoid writing instructions or notes back to me, JUST output the text sections.

Output format EXACTLY like this (use exactly these markers):
===HOOK AD===
[Your text here...]

===STORYTELLING AD===
[Your text here...]

===OFFER AD===
[Your text here...]

===TESTIMONIAL AD===
[Your text here...]
`;
    if (!ai) {
        throw new Error("Gemini API not configured correctly.");
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text, creditsLeft: 4 });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "Failed to generate" });
  }
});

app.post("/api/generate-video", async (req, res) => {
  try {
    const heygenKey = process.env.HEYGEN_API_KEY;
    if (!heygenKey) {
      return res.status(400).json({ error: "HEYGEN_API_KEY is not configured in Secrets." });
    }

    const { script, title } = req.body;

    // This is a basic integration to the HeyGen Create Video v2 endpoint
    // You can customize the avatar and voice IDs based on available HeyGen assets
    const heygenResponse = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        "X-Api-Key": heygenKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: "Daisy-inskirt-20220818", // Example Professional Avatar ID
              avatar_style: "normal"
            },
            voice: {
              type: "text",
              input_text: script || "Welcome to our product. Please add script here.",
              voice_id: "1bd001e7e50f421d891986aad5158bc8" // Example Voice ID
            }
          }
        ],
        dimension: {
          width: 1080,
          height: 1920
        },
        title: title || "AI Studio Generated Video"
      })
    });

    if (!heygenResponse.ok) {
      const errorText = await heygenResponse.text();
      throw new Error(`HeyGen API Error: ${errorText}`);
    }

    const data = await heygenResponse.json();
    
    // Returns a video_id which you can then poll or setup webhooks to get the final mp4 URL
    res.json(data);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "Failed to generate video" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    // Only import vite dynamically in local dev, hidden from static analysis
    try {
      const v = "vite";
      const viteModule = await import(/* @vite-ignore */ v);
      const vite = await viteModule.createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch(e) {
      console.log('skipping vite');
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server directly if not running in a serverless environment like Vercel
if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
