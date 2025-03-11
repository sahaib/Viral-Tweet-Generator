import { NextRequest, NextResponse } from "next/server";

// Define the prompt template for tweet generation
const generatePrompt = (topic: string) => {
  // Truncate topic if it's too long while preserving meaning
  const truncatedTopic = topic.length > 200 ? topic.slice(0, 197) + "..." : topic;

  return `
Role: You're a social media expert who creates viral, engaging tweets that resonate with diverse audiences. Create tweets that are informative, engaging, and shareable.

Context:
- Audience: General public with varying interests and backgrounds
- Focus: Creating engaging, shareable content that provides value
- Tone: Conversational, engaging, and authentic

Key Elements to Include:
- Hook: Start with an attention-grabbing statement or question
- Value: Provide interesting information, insight, or perspective
- Engagement Trigger: Include elements that encourage likes, retweets, or replies
- Authenticity: Keep the tone genuine and relatable
- Timing: Make it feel current and relevant

Guidelines:
- Use clear, accessible language
- Include specific details or numbers when relevant
- Create curiosity or spark discussion
- Add personality while maintaining credibility
- Structure: Hook → Value → Call-to-Action/Discussion Point

Topic: ${truncatedTopic}

Generate a single engaging tweet (max 280 characters) about this topic using the above framework. Focus on making it shareable and discussion-worthy. Do not include any explanations, just output the tweet text.
`;
};

// Function to call Groq API
async function callGroqAPI(prompt: string) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();

  return data.choices[0].message.content.trim();
}

// Function to call OpenRouter API (fallback)
async function callOpenRouterAPI(prompt: string) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not defined");
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://viral-tweet-generator.vercel.app";

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": appUrl,
        "X-Title": "Viral Tweet Generator",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();

  return data.choices[0].message.content.trim();
}

// Validate input
function validateInput(topic: string) {
  if (!topic) {
    return { valid: false, error: "Topic is required" };
  }

  // Remove validation for topic length since we'll truncate it if needed
  // if (topic.length > 200) {
  //   return { valid: false, error: "Topic is too long (max 200 characters)" };
  // }

  // Check for potentially harmful content
  const bannedTerms = ["harmful", "illegal", "offensive", "hate speech"];

  for (const term of bannedTerms) {
    if (topic.toLowerCase().includes(term)) {
      return { valid: false, error: "Topic contains inappropriate content" };
    }
  }

  return { valid: true, error: null };
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const { topic, useGroq = true } = await request.json();

    // Validate input
    const validation = validateInput(topic);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate the prompt
    const prompt = generatePrompt(topic);

    let tweet = "";

    // Get origin and check if it's allowed
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "http://localhost:3000",
      "https://viral-tweet-generator.vercel.app",
      "https://viral-tweet-generator-one.vercel.app",
      "https://tweetsgen.sahaibsingh.com",
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter(Boolean);

    const isAllowedOrigin = !origin || allowedOrigins.includes(origin);

    if (useGroq) {
      try {
        // Try Groq first
        tweet = await callGroqAPI(prompt);
      } catch (error) {
        // Log error details in production for debugging
        if (process.env.NODE_ENV === "production") {
          // Using Response object to log errors without console
          return NextResponse.json(
            { error: "Groq API error, falling back to OpenRouter", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
          );
        }
        // Fallback to OpenRouter without logging
        tweet = await callOpenRouterAPI(prompt);
      }
    } else {
      // Directly use OpenRouter
      tweet = await callOpenRouterAPI(prompt);
    }

    // Set CORS headers
    const headers = new Headers();

    if (origin && isAllowedOrigin) {
      headers.set("Access-Control-Allow-Origin", origin);
    }
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    return NextResponse.json({ tweet }, { headers });
  } catch (error) {
    // Error handling with more details in production
    return NextResponse.json(
      { 
        error: "Failed to generate tweet", 
        details: error instanceof Error ? error.message : String(error),
        env: {
          hasGroqKey: !!process.env.GROQ_API_KEY,
          hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set"
        }
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "https://viral-tweet-generator.vercel.app",
    "https://viral-tweet-generator-one.vercel.app",
    "https://tweetsgen.sahaibsingh.com",
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  const isAllowedOrigin = !origin || allowedOrigins.includes(origin);

  // Set CORS headers
  const headers = new Headers();

  if (origin && isAllowedOrigin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  return new Response(null, { status: 204, headers });
}
