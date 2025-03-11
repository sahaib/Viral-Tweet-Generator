import { NextRequest, NextResponse } from "next/server";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

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

// Define allowed origins
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173", // Vite dev server
  "https://viral-tweet-generator.vercel.app",
  "https://viral-tweet-generator-one.vercel.app",
  "https://tweetgen.sahaibsingh.com",
  "https://tweetsgen.sahaibsingh.com",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

// Add delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create a singleton instance of DuckDuckGoSearch with max results
const ddg = new DuckDuckGoSearch({
  maxResults: 10,
});

// Helper function to handle CORS
function corsHeaders(origin: string): Record<string, string> {
  // In development, allow any origin
  if (process.env.NODE_ENV === 'development') {
    return {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }

  // In production, check against allowed origins
  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }

  // Return empty headers if origin not allowed
  return {
    "Access-Control-Allow-Origin": "null",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin") || "";
  const headers = corsHeaders(origin);

  // In development, skip origin check
  if (process.env.NODE_ENV === 'development' || ALLOWED_ORIGINS.includes(origin)) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { headers });
    }

    try {
      const { searchParams } = new URL(request.url);
      let searchQuery = searchParams.get("q") || "";

      // If no query provided, return empty results
      if (!searchQuery.trim()) {
        return new NextResponse(
          JSON.stringify({ 
            articles: [],
            message: "Please enter a search query" 
          }), 
          {
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Add "latest news" to the query to focus on news results
      searchQuery = `${searchQuery} latest news`;

      // Add random delay between 1-3 seconds to avoid rate limiting
      await delay(Math.random() * 2000 + 1000);

      // Use LangChain's DuckDuckGo search with timeout
      const searchPromise = ddg.invoke(searchQuery);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Search timed out")), 10000);
      });

      const results = await Promise.race([searchPromise, timeoutPromise]);
      
      if (!results || typeof results !== 'string') {
        throw new Error("Invalid search results format");
      }

      // Parse the results string into individual items
      const items = JSON.parse(results);
      
      if (!Array.isArray(items)) {
        throw new Error("Search results are not in the expected format");
      }

      const articles: NewsItem[] = items.map((item: any) => {
        // Extract domain name for the source
        const domain = item.link ? new URL(item.link).hostname.replace('www.', '') : 'news source';
        
        return {
          source: {
            id: "ddg",
            name: domain,
          },
          title: item.title || "",
          url: item.link || "",
          publishedAt: new Date().toISOString(),
          author: domain,
          snippet: item.snippet || item.title || ""
        };
      });

      return new NextResponse(JSON.stringify({ articles }), {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      });

    } catch (error) {
      console.error("Search error:", error);
      
      return new NextResponse(
        JSON.stringify({
          error: "Unable to fetch search results at this time. Please try again later.",
          details: error instanceof Error ? error.message : String(error),
          articles: [] // Add empty articles array for consistency
        }),
        {
          status: 500,
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  // If origin not allowed, return 403
  return new NextResponse(null, {
    status: 403,
    statusText: "Forbidden",
    headers,
  });
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") || "";
  const headers = corsHeaders(origin);

  // Always return 204 for OPTIONS with appropriate CORS headers
  return new NextResponse(null, {
    status: 204,
    headers,
  });
} 