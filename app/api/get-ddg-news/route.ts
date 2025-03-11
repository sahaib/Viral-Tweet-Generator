import { NextRequest, NextResponse } from "next/server";
import { search, SafeSearchType, SearchResult as DDGSearchResult } from "duck-duck-scrape";

interface NewsItem {
  source: {
    id: string;
    name: string;
  };
  title: string;
  url: string;
  publishedAt: string;
  author: string;
  snippet: string;
}

interface SearchResponse {
  noResults: boolean;
  vqd: string;
  results: DDGSearchResult[];
}

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://tweetgen.sahaibsingh.com",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

// Add delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: Request) {
  // Handle CORS
  const origin = request.headers.get("origin") || "";
  
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden",
    });
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("q") || "";

    // Add random delay between 1-3 seconds to avoid rate limiting
    await delay(Math.random() * 2000 + 1000);

    // Use a more conservative search approach
    const searchPromise = search(searchQuery, {
      safeSearch: SafeSearchType.MODERATE,
    });

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Search timed out")), 10000);
    });

    const results = await Promise.race([searchPromise, timeoutPromise]);

    if (!results || !Array.isArray(results)) {
      throw new Error("Invalid search results");
    }

    const newsItems: NewsItem[] = results
      .slice(0, 10)
      .map(result => ({
        source: {
          id: "ddg",
          name: new URL(result.url).hostname.replace('www.', ''),
        },
        title: result.title || "",
        url: result.url || "",
        publishedAt: new Date().toISOString(), // DuckDuckGo doesn't provide dates
        author: "Via DuckDuckGo",
        snippet: result.description,
      }));

    return new NextResponse(JSON.stringify({ items: newsItems }), {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Search error:", error);
    
    // Return a more user-friendly error
    return new NextResponse(
      JSON.stringify({
        error: "Unable to fetch search results at this time. Please try again later.",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Content-Type": "application/json",
        },
      }
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
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  return new Response(null, { status: 204, headers });
} 