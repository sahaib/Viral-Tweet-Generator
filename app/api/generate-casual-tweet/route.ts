import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper function to handle CORS
function corsHeaders(origin: string): Record<string, string> {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://viral-tweet-generator.vercel.app",
    "https://viral-tweet-generator-one.vercel.app",
    "https://tweetgen.sahaibsingh.com",
    "https://tweetsgen.sahaibsingh.com",
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  if (process.env.NODE_ENV === 'development') {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }

  if (allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    };
  }

  return {
    "Access-Control-Allow-Origin": "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function generateWithGroq(topic: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a casual tweet generator that creates relatable, funny, and engaging tweets. Your tweets should be short, use emojis naturally, and feel authentic. Focus on everyday situations, tech, social media, and modern life observations. Keep the tone light and humorous."
        },
        {
          role: "user",
          content: `Generate a relatable, casual tweet about ${topic}. Make it funny and engaging, similar to: "Social Media will have you sitting on the toilet for 145 mins 😭". Use emojis naturally and keep it authentic.`
        }
      ],
      temperature: 0.9,
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate with Groq");
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function generateWithOpenRouter(topic: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://tweetgen.sahaibsingh.com",
      "Content-Type": "application/json",
      "X-Title": "Tweet Generator"
    },
    body: JSON.stringify({
      model: "google/gemma-3-27b-it:free",
      messages: [
        {
          role: "user",
          content: `You are writing a funny, relatable tweet about ${topic}. The tweet should be short, use emojis naturally, and feel authentic. Make it similar to this style: "Social Media will have you sitting on the toilet for 145 mins 😭". Focus on everyday situations and modern life observations. Keep it light and humorous. Write just the tweet, nothing else.`
        }
      ],
      temperature: 0.9,
      max_tokens: 100,
      stop: ["User:", "Assistant:", "System:"]
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("OpenRouter API error:", errorData);
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
    console.error("Unexpected OpenRouter API response:", data);
    throw new Error("Invalid response format from OpenRouter API");
  }

  return data.choices[0].message.content.trim();
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const headers = corsHeaders(origin);

  try {
    const { topic, useGroq } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400, headers }
      );
    }

    try {
      // Use the selected model
      const tweet = useGroq 
        ? await generateWithGroq(topic)
        : await generateWithOpenRouter(topic);
      
      return NextResponse.json({ tweet }, { headers });
    } catch (error) {
      console.error(`${useGroq ? "Groq" : "OpenRouter"} generation failed:`, error);
      
      // If Groq fails, try OpenRouter as fallback only if Groq was selected
      if (useGroq) {
        try {
          console.log("Falling back to OpenRouter...");
          const tweet = await generateWithOpenRouter(topic);
          return NextResponse.json({ tweet }, { headers });
        } catch (fallbackError) {
          console.error("OpenRouter fallback failed:", fallbackError);
          throw fallbackError;
        }
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Tweet generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate tweet" },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const headers = corsHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
} 