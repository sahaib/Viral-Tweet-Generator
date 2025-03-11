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

export async function GET(request: NextRequest) {
  try {
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

    if (!isAllowedOrigin) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "latest news";
    
    // Perform the search with a timeout
    const searchPromise = search(query, {
      safeSearch: SafeSearchType.MODERATE
    });
    
    // Add timeout of 10 seconds
    const timeoutPromise = new Promise<SearchResponse>((_, reject) => {
      setTimeout(() => reject(new Error('Search timed out')), 10000);
    });
    
    // Race between search and timeout
    const results = await Promise.race([searchPromise, timeoutPromise]);

    // Transform results into our NewsItem format
    const articles: NewsItem[] = results.results
      .map((result: DDGSearchResult) => {
        const domain = new URL(result.url).hostname.replace('www.', '');
        return {
          source: {
            id: "ddg",
            name: domain,
          },
          title: result.title,
          url: result.url,
          publishedAt: new Date().toISOString(),
          author: "Via " + domain,
          snippet: result.description,
        };
      })
      .slice(0, 10); // Limit to 10 results

    // Set CORS headers
    const headers = new Headers();

    if (origin && isAllowedOrigin) {
      headers.set("Access-Control-Allow-Origin", origin);
    }
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    return NextResponse.json({ articles }, { headers });
  } catch (error) {
    console.error("Error fetching search results:", error);

    return NextResponse.json(
      { error: "Failed to fetch search results", details: error instanceof Error ? error.message : String(error) },
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