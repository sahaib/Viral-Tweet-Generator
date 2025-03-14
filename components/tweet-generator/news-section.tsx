"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Tabs, Tab } from "@heroui/tabs";
import { Input } from "@heroui/input";
import { track } from "@vercel/analytics";

interface NewsItem {
  title: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: string;
  author?: string;
  fullContent?: string;
  snippet?: string;
}

interface NewsSectionProps {
  onSelectTopic: (topic: string, fullContent?: string) => void;
}

const NewsSection: React.FC<NewsSectionProps> = ({ onSelectTopic }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [athinaNews, setAthinaNews] = useState<NewsItem[]>([]);
  const [ddgNews, setDdgNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAthinaLoading, setIsAthinaLoading] = useState<boolean>(true);
  const [isDdgLoading, setIsDdgLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [athinaError, setAthinaError] = useState<string | null>(null);
  const [ddgError, setDdgError] = useState<string | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null,
  );
  const [selectedTab, setSelectedTab] = useState<string>("tech");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/get-news");

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await response.json();

      setNews(data.articles || []);
    } catch (err) {
      setError("Failed to load news. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAthinaNews = async () => {
    setIsAthinaLoading(true);
    setAthinaError(null);

    try {
      const response = await fetch("/api/get-athina-news");

      if (!response.ok) {
        throw new Error("Failed to fetch Athina AI Hub news");
      }

      const data = await response.json();

      setAthinaNews(data.articles || []);
    } catch (err) {
      setAthinaError("Failed to load Athina AI Hub news. Please try again.");
    } finally {
      setIsAthinaLoading(false);
    }
  };

  const fetchDdgNews = async (query: string) => {
    setIsDdgLoading(true);
    setDdgError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchTerm: query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      setDdgNews(data.articles || []);
    } catch (err) {
      setDdgError("Failed to load search results. Please try again.");
    } finally {
      setIsDdgLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchAthinaNews();
    fetchDdgNews(searchQuery);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleUseTopic = (item: NewsItem, index: number) => {
    // Use fullContent if available, otherwise combine title and snippet
    const content = item.fullContent || `${item.title}\n\n${item.snippet || ''}`;
    console.log('News item selected:', { item, content });
    
    // Ensure we're passing non-empty values
    if (item.title.trim()) {
      onSelectTopic(item.title.trim(), content.trim());
      setSelectedItemIndex(index);

      // Track when a news item is selected
      track("news_item_selected", {
        title: item.title,
        source: selectedTab,
        hasFullContent: !!item.fullContent
      });

      // Reset the selected item after a delay
      setTimeout(() => {
        setSelectedItemIndex(null);
      }, 2000);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Track search attempt
      track("news_search", {
        query: searchQuery
      });
      fetchDdgNews(searchQuery);
    }
  };

  const handleRefresh = () => {
    // Track refresh action
    track("news_refresh", {
      source: selectedTab
    });

    if (selectedTab === "tech") {
      fetchNews();
    } else if (selectedTab === "athina") {
      fetchAthinaNews();
    } else {
      fetchDdgNews(searchQuery);
    }
  };

  // Track tab changes
  const handleTabChange = (key: string) => {
    track("news_tab_changed", {
      from: selectedTab,
      to: key
    });
    setSelectedTab(key);
  };

  const renderNewsItems = (items: NewsItem[], isLoading: boolean, error: string | null) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-danger text-sm p-4 text-center border border-danger-200 rounded-lg bg-danger-50">
          {error}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-default-500 text-sm p-4 text-center border border-default-200 rounded-lg">
          No news available at the moment.
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1">
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col gap-1 p-3 rounded-lg border ${
              selectedItemIndex === index
                ? "border-success bg-success-50"
                : "border-default-100 hover:bg-default-50"
            } transition-colors`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-default-400">
                {item.source.name} {item.author ? `• ${item.author}` : ""} • {formatDate(item.publishedAt)}
              </span>
              <Button
                className="px-2 py-1 h-auto min-w-0"
                color={selectedItemIndex === index ? "success" : "secondary"}
                size="sm"
                variant="light"
                onClick={() => handleUseTopic(item, index)}
              >
                {selectedItemIndex === index ? "Used" : "Use"}
              </Button>
            </div>
            <Link
              isExternal
              className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
              href={item.url}
            >
              {item.title}
            </Link>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-6 rounded-xl border border-default-200 bg-content1 shadow-sm h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">News Sources</h2>
        <Button
          color="primary"
          isLoading={
            selectedTab === "tech" 
              ? isLoading 
              : selectedTab === "athina" 
                ? isAthinaLoading 
                : isDdgLoading
          }
          size="sm"
          variant="flat"
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </div>

      <div className="p-3 rounded-lg bg-warning-50 border border-warning-200 text-warning-700 text-sm">
        <strong>Important Disclaimer:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>This is a tweet generation tool, not a news verification service.</li>
          <li>Always verify information from the original sources by clicking the article links.</li>
          <li>Check multiple reliable sources before sharing news content.</li>
          <li>Be responsible when sharing information on social media.</li>
        </ul>
      </div>

      <Tabs 
        aria-label="News Sources" 
        selectedKey={selectedTab}
        onSelectionChange={(key) => handleTabChange(key as string)}
        className="w-full"
      >
        <Tab key="tech" title="Tech News">
          <p className="text-default-500 text-sm mb-4">
            Find inspiration from the latest tech news
          </p>
          {renderNewsItems(news, isLoading, error)}
        </Tab>
        <Tab key="athina" title="Athina AI Hub">
          <p className="text-default-500 text-sm mb-4 text-justify">
            Content sourced from Athina AI Hub (hub.athina.ai). All articles and content belong to their respective authors and Athina AI.
          </p>
          {renderNewsItems(athinaNews, isAthinaLoading, athinaError)}
        </Tab>
        <Tab key="search" title="AI Search">
          <div className="flex flex-col gap-4">
            <p className="text-default-500 text-sm">
              Search across the web using AI-powered search for more relevant results
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                className="flex-grow"
                placeholder="Search any topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                color="primary"
                isLoading={isDdgLoading}
                type="submit"
                size="sm"
              >
                Search
              </Button>
            </form>
            {renderNewsItems(ddgNews, isDdgLoading, ddgError)}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default NewsSection;
