import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface NewsItem {
  source: {
    id: string;
    name: string;
  };
  title: string;
  url: string;
  publishedAt: string;
  author: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get origin and check if it's allowed
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "http://localhost:3000",
      "https://viral-tweet-generator.vercel.app",
      "https://viral-tweet-generator-one.vercel.app",
      "https://tweetgen.sahaibsingh.com",
      "https://tweetsgen.sahaibsingh.com",
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter(Boolean);

    const isAllowedOrigin = !origin || allowedOrigins.includes(origin);

    if (!isAllowedOrigin) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // Fetch Athina AI Hub news
    const response = await fetch("https://hub.athina.ai/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      cache: "no-store",
      next: { revalidate: 0 }, // Disable caching
    });

    if (!response.ok) {
      throw new Error(`Athina AI Hub fetch error: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Fetched HTML length:', html.length);
    
    const $ = cheerio.load(html);
    const articles: NewsItem[] = [];

    // Try to find the main content area first
    const mainContent = $('.post-feed, .content, main, #main, .site-main');
    console.log('Main content found:', mainContent.length > 0);

    if (mainContent.length > 0) {
      // Look for articles within the main content
      mainContent.find('article, .post, .post-card').each((_i: number, element: any) => {
        // Extract title - try multiple selectors
        const titleElement = $(element).find('h2, .post-title, .title, .post-card-title, a:has(h2)').first();
        const title = titleElement.text().trim();
        
        // Extract URL - try multiple approaches
        let url = '';
        const linkElement = titleElement.is('a') ? titleElement : titleElement.find('a').first();
        if (linkElement.length) {
          url = linkElement.attr('href') || '';
        }
        if (!url) {
          const parentLink = titleElement.closest('a');
          if (parentLink.length) {
            url = parentLink.attr('href') || '';
          }
        }
        
        // Handle relative URLs
        if (url && !url.startsWith('http')) {
          url = new URL(url, 'https://hub.athina.ai').toString();
        }
        
        // Extract date if available - try multiple selectors
        const dateElement = $(element).find('time, .date, .post-date, .published-at');
        const publishedAt = dateElement.length ? 
          new Date(dateElement.attr('datetime') || dateElement.text() || '').toISOString() : 
          new Date().toISOString();
        
        // Extract author - try multiple selectors
        const authorElement = $(element).find('.author, .post-author, .byline');
        const author = authorElement.text().trim() || "Athina AI";
        
        console.log('Found article:', { title, url });
        
        if (title && url && !articles.some(a => a.url === url)) {
          articles.push({
            source: { id: "athina-ai", name: "Athina AI Hub" },
            title,
            url,
            publishedAt,
            author
          });
        }
      });
    }

    // If no articles found, try a broader search
    if (articles.length === 0) {
      console.log('No articles found in main content, trying broader search...');
      
      // Look for any heading that's wrapped in a link
      $('h1 a, h2 a, h3 a, a:has(h1), a:has(h2), a:has(h3)').each((_i: number, element: any) => {
        const link = $(element);
        const title = link.text().trim();
        let url = link.attr('href') || '';
        
        // Handle relative URLs
        if (url && !url.startsWith('http')) {
          url = new URL(url, 'https://hub.athina.ai').toString();
        }
        
        if (title && url && url.includes('hub.athina.ai') && 
            title.length > 20 && // Likely a blog post title
            !articles.some(a => a.url === url)) {
          console.log('Found article via broader search:', { title, url });
          
          articles.push({
            source: { id: "athina-ai", name: "Athina AI Hub" },
            title,
            url,
            publishedAt: new Date().toISOString(),
            author: "Athina AI"
          });
        }
      });
    }

    console.log(`Total articles found: ${articles.length}`);

    // If still no articles found, return mock data in development
    if (articles.length === 0 && process.env.NODE_ENV === "development") {
      console.log('No articles found, returning mock data');
      
      return NextResponse.json({
        status: "ok",
        articles: [
          {
            source: { id: "athina-ai", name: "Athina AI Hub" },
            title: "Top 10 LLM Papers of the Week: 1st March - 9th March",
            url: "https://hub.athina.ai/top-10-llm-papers-of-the-week-1st-march-9th-march",
            publishedAt: new Date().toISOString(),
            author: "Paras Madan"
          },
          {
            source: { id: "athina-ai", name: "Athina AI Hub" },
            title: "Top 10 Papers on LLM Evaluation and Benchmarking from February 2025",
            url: "https://hub.athina.ai/top-10-papers-on-llm-evaluation-and-benchmarking-from-february-2025",
            publishedAt: new Date().toISOString(),
            author: "Paras Madan"
          },
          {
            source: { id: "athina-ai", name: "Athina AI Hub" },
            title: "Top 10 RAG Papers from February 2025",
            url: "https://hub.athina.ai/top-10-rag-papers-from-february-2025",
            publishedAt: new Date().toISOString(),
            author: "Paras Madan"
          },
        ],
      }, { headers: new Headers() });
    }

    // Set CORS headers
    const headers = new Headers();

    if (origin && isAllowedOrigin) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Credentials", "true");
    } else if (process.env.NODE_ENV === 'development') {
      headers.set("Access-Control-Allow-Origin", "*");
    } else {
      headers.set("Access-Control-Allow-Origin", "null");
    }
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    // Return the articles
    return NextResponse.json({ status: "ok", articles }, { headers });
  } catch (error) {
    console.error("Error fetching Athina AI Hub news:", error);

    // Return mock data in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        status: "ok",
        articles: [
          {
            source: { id: "athina-ai", name: "Athina AI Hub" },
            title: "Top 10 LLM Papers of the Week: 1st March - 9th March",
            url: "https://hub.athina.ai/top-10-llm-papers-of-the-week-1st-march-9th-march",
            publishedAt: new Date().toISOString(),
            author: "Paras Madan"
          },
          {
            source: { id: "athina-ai", name: "Athina AI Hub" },
            title: "Top 10 Papers on LLM Evaluation and Benchmarking from February 2025",
            url: "https://hub.athina.ai/top-10-papers-on-llm-evaluation-and-benchmarking-from-february-2025",
            publishedAt: new Date().toISOString(),
            author: "Paras Madan"
          },
          {
            source: { id: "athina-ai", name: "Athina AI Hub" },
            title: "Top 10 RAG Papers from February 2025",
            url: "https://hub.athina.ai/top-10-rag-papers-from-february-2025",
            publishedAt: new Date().toISOString(),
            author: "Paras Madan"
          },
        ],
      }, { headers: new Headers() });
    }

    return NextResponse.json(
      { error: "Failed to fetch Athina AI Hub news" },
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
    "https://tweetgen.sahaibsingh.com",
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