import { NextRequest, NextResponse } from "next/server";

// Define the prompt template for tweet generation
const generatePrompt = (topic: string) => {
  return `
Role: You're a viral content strategist for tech and AI. Create high-engagement tweets that blend curiosity, urgency, and debate.

Context:
- Audience: Tech founders, developers, AI enthusiasts.
- Trends: Focus on cutting-edge tools, ethical debates, or disruptive predictions.
- Tone: Bold, conversational, slightly provocative. Use humor, analogies, and cliffhangers.

Key Elements to Include:
- Hook: Start with a shocking stat, analogy, or question.
- Bold Angle: Add a contrarian take, prediction, or comparison.
- Engagement Trigger: End with a debate question, poll, or FOMO tease.
- Viral Structure: Short lines, emoji breaks (🚀/🤯/💡), italics for emphasis.

Topic: ${topic}

Generate a single viral tweet (max 280 characters) about this topic using the above framework. Prioritize shareable, debate-driven language. Do not include any explanations, just output the tweet text.
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

  if (topic.length > 200) {
    return { valid: false, error: "Topic is too long (max 200 characters)" };
  }

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
    // Check if the request is from an allowed origin
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "http://localhost:3000",
      "https://viral-tweet-generator.vercel.app",
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter(Boolean);

    const isAllowedOrigin = !origin || allowedOrigins.includes(origin);

    if (!isAllowedOrigin) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const { topic, useGroq } = await request.json();

    // Validate input
    const validation = validateInput(topic);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const prompt = generatePrompt(topic);
    let tweet;

    if (useGroq) {
      try {
        // Try Groq first
        tweet = await callGroqAPI(prompt);
      } catch (error) {
        console.error("Groq API error, falling back to OpenRouter:", error);
        // Fallback to OpenRouter
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
    console.error("Error generating tweet:", error);

    return NextResponse.json(
      { error: "Failed to generate tweet" },
      { status: 500 },
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "https://viral-tweet-generator.vercel.app",
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  const isAllowedOrigin = !origin || allowedOrigins.includes(origin);

  const headers = new Headers();

  if (origin && isAllowedOrigin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  return new NextResponse(null, { headers });
}
