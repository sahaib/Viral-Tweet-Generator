import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY || "d049a509c1b54e1c8f7d6f4a2f1f3e6b"; // Free API key for testing

async function searchNews(query: string) {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(query)}&` +
      `sortBy=relevancy&` +
      `language=en&` +
      `pageSize=10`,
      {
        headers: {
          'X-Api-Key': NEWS_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`News API search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("News API search error:", error);
    throw error;
  }
}

async function enhanceWithGroq(searchResults: any) {
  try {
    const response = await fetch("https://api.groq.com/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [{
          role: "system",
          content: "You are a search result enhancer. Given search results, analyze them and provide relevant insights."
        }, {
          role: "user",
          content: `Analyze these search results and provide key insights: ${JSON.stringify(searchResults)}`
        }],
        temperature: 0.5,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`Groq enhancement failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Groq enhancement error:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { searchTerm } = await req.json();

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Search term is required" },
        { status: 400 }
      );
    }

    // Get search results from News API
    const searchResults = await searchNews(searchTerm);
    
    // Enhance results with Groq
    const enhancement = await enhanceWithGroq(searchResults);

    // Transform results to match our expected format
    const transformedResults = searchResults.articles.map((article: any) => ({
      title: article.title,
      url: article.url,
      snippet: article.description,
      source: {
        name: article.source.name,
      },
      publishedAt: article.publishedAt,
    }));

    return NextResponse.json({
      articles: transformedResults,
      enhancement: enhancement
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
} 