import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
    }

    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    if (!NEWS_API_KEY) {
      throw new Error("NEWS_API_KEY is not defined");
    }

    // Fetch tech news from NewsAPI
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    const data = await response.json();

    // Set CORS headers
    const headers = new Headers();
    if (origin && isAllowedOrigin) {
      headers.set("Access-Control-Allow-Origin", origin);
    }
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    // Return the articles
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("Error fetching news:", error);
    
    // If there's an error, return mock data for development
    if (process.env.NODE_ENV === "development") {
      // Get origin and check if it's allowed
      const origin = request.headers.get("origin");
      const allowedOrigins = [
        "http://localhost:3000",
        "https://viral-tweet-generator.vercel.app",
        process.env.NEXT_PUBLIC_APP_URL,
      ].filter(Boolean);
      
      const isAllowedOrigin = !origin || allowedOrigins.includes(origin);
      
      const mockData = {
        status: "ok",
        articles: [
          {
            source: { id: "techcrunch", name: "TechCrunch" },
            title: "AI startup raises $100M to build next-gen language models",
            url: "https://example.com/ai-startup",
            publishedAt: new Date().toISOString(),
          },
          {
            source: { id: "wired", name: "Wired" },
            title: "The future of coding: Will AI replace developers?",
            url: "https://example.com/future-coding",
            publishedAt: new Date().toISOString(),
          },
          {
            source: { id: "theverge", name: "The Verge" },
            title: "New chip architecture promises 10x performance boost",
            url: "https://example.com/new-chip",
            publishedAt: new Date().toISOString(),
          },
        ],
      };

      // Set CORS headers for mock data
      const headers = new Headers();
      if (origin && isAllowedOrigin) {
        headers.set("Access-Control-Allow-Origin", origin);
      }
      headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");

      return NextResponse.json(mockData, { headers });
    }
    
    return NextResponse.json(
      { error: "Failed to fetch news" },
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
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);
  
  const isAllowedOrigin = !origin || allowedOrigins.includes(origin);
  
  const headers = new Headers();
  if (origin && isAllowedOrigin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  
  return new NextResponse(null, { headers });
} 