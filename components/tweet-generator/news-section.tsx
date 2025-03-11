"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

interface NewsItem {
  title: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: string;
}

interface NewsSectionProps {
  onSelectTopic: (topic: string) => void;
}

const NewsSection: React.FC<NewsSectionProps> = ({ onSelectTopic }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null,
  );

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
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleUseTopic = (title: string, index: number) => {
    onSelectTopic(title);
    setSelectedItemIndex(index);

    // Reset the selected item after a delay
    setTimeout(() => {
      setSelectedItemIndex(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-6 rounded-xl border border-default-200 bg-content1 shadow-sm h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Latest Tech News</h2>
        <Button
          color="primary"
          isLoading={isLoading}
          size="sm"
          variant="flat"
          onClick={fetchNews}
        >
          Refresh
        </Button>
      </div>

      <p className="text-default-500 text-sm">
        Find inspiration from the latest tech news
      </p>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {error && (
        <div className="text-danger text-sm p-4 text-center border border-danger-200 rounded-lg bg-danger-50">
          {error}
        </div>
      )}

      {!isLoading && !error && news.length === 0 && (
        <div className="text-default-500 text-sm p-4 text-center border border-default-200 rounded-lg">
          No news available at the moment.
        </div>
      )}

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1">
        {news.map((item, index) => (
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
                {item.source.name} • {formatDate(item.publishedAt)}
              </span>
              <Button
                className="px-2 py-1 h-auto min-w-0"
                color={selectedItemIndex === index ? "success" : "secondary"}
                size="sm"
                variant="light"
                onClick={() => handleUseTopic(item.title, index)}
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
    </div>
  );
};

export default NewsSection;
