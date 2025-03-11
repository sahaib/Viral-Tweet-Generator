import { NextRequest, NextResponse } from "next/server";

// Define the prompt template for tweet generation
const generatePrompt = (topic: string, fullContent?: string) => {
  // Truncate topic if it's too long while preserving meaning
  const truncatedTopic = topic.length > 200 ? topic.slice(0, 197) + "..." : topic;

  const contextSection = fullContent 
    ? `Context:
Topic to create a tweet about: "${truncatedTopic}"
Full content to reference:
${fullContent}`
    : `Context:
Topic to create a tweet about: "${truncatedTopic}"`;

  return `
Role: You are an elite social media strategist who specializes in creating viral tweets that consistently get high engagement. Your tweets are known for their perfect blend of curiosity, value, and emotional resonance.

${contextSection}

IMPORTANT: Each tweet must use a DIFFERENT opening pattern. Never default to the same starter. Vary your approach for each tweet.

Key Tweet Elements to Master:
1. Dynamic Opening Patterns (choose one, never repeat):
   - Direct Value: "The best way to..."
   - Insight Hook: "What most people get wrong about..."
   - Expert Perspective: "Top performers always..."
   - Future Vision: "The future of..."
   - Contrarian View: "Everyone says X, but..."
   - Discovery: "Just found out why..."
   - Question Hook: "Ever wondered why..."
   - Challenge: "Stop doing X if you..."
   - Framework: "The key principles of..."
   - Reality Check: "Here's the truth about..."

2. Value Delivery:
   - Share meaningful insights and observations
   - Offer unique perspectives or contrarian views
   - Break down complex topics into simple insights
   - Reveal insider knowledge or expert tips
   - Challenge common misconceptions

3. Engagement Triggers:
   - Ask thought-provoking questions
   - Use "You" to make it personal
   - Share relatable experiences
   - Create "aha moments"
   - Encourage saves and shares

4. Viral Elements (include at least one):
   - Counterintuitive insights
   - "I wish I knew this sooner" moments
   - Actionable takeaways
   - Unexpected revelations
   - Industry secrets or behind-the-scenes info

Style Guide:
- Write in a conversational, yet authoritative tone
- Use short, punchy sentences
- Focus on qualitative insights rather than unverified statistics
- Create a sense of immediacy
- End with a powerful insight or call-to-action
- Avoid hashtags unless absolutely necessary
- Keep under 280 characters
- Use emojis sparingly and strategically
- NEVER use made-up statistics or specific numbers without verification
- NEVER default to repetitive openers

Example Tweet Structures (for inspiration only, create unique variations):
1. "The hidden truth about [topic] that experts don't talk about:"
2. "Want better results with [topic]? Start with this unconventional approach:"
3. "The real reason most people struggle with [topic]:"
4. "Everyone gets this wrong about [topic]. Here's why:"
5. "The one thing that changed everything I knew about [topic]:"
6. "Stop wasting time on [topic] until you understand this:"

Generate a single tweet that would make people stop scrolling, engage with the content, and feel compelled to share it with others. Focus on providing genuine value while maintaining high virality potential.

Output the tweet text only, no explanations or additional context.
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
    const { topic, fullContent, useGroq = true } = await request.json();

    // Validate input
    const validation = validateInput(topic);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate the prompt
    const prompt = generatePrompt(topic, fullContent);

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
