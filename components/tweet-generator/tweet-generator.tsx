"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { track } from "@vercel/analytics";

interface TweetGeneratorProps {
  externalTopic?: string;
  externalContent?: string;
}

const TweetGenerator: React.FC<TweetGeneratorProps> = ({ externalTopic, externalContent }) => {
  const [topic, setTopic] = useState<string>("");
  const [fullContent, setFullContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedTweet, setGeneratedTweet] = useState<string>("");
  const [useGroq, setUseGroq] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Effect to update the topic and content when external values change
  useEffect(() => {
    console.log('External values changed:', { externalTopic, externalContent });
    
    if (externalTopic || externalContent) {
      // Update topic if provided
      if (externalTopic) {
        console.log('Setting topic to:', externalTopic);
        setTopic(externalTopic);
      }

      // Update content if provided
      if (externalContent) {
        console.log('Setting content to:', externalContent);
        setFullContent(externalContent);
        // Automatically trigger tweet generation with new content
        handleGenerateTweet(externalTopic || topic, externalContent);
      }

      // Track when content is received from news
      track("content_received_from_news", {
        topic: externalTopic || '',
        hasContent: !!externalContent,
        contentLength: externalContent?.length || 0
      });

      // Clear error if any
      setError(null);
    }
  }, [externalTopic, externalContent]);

  // Reset states when component unmounts
  useEffect(() => {
    return () => {
      setTopic("");
      setFullContent("");
      setGeneratedTweet("");
      setError(null);
    };
  }, []);

  const handleGenerateTweet = async (currentTopic?: string, currentContent?: string) => {
    const topicToUse = currentTopic || topic;
    const contentToUse = currentContent || fullContent;

    console.log('Generating tweet with:', { topicToUse, contentToUse });
    
    if (!topicToUse.trim()) {
      setError("Please enter a topic");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedTweet("");

    try {
      // Track tweet generation attempt
      track("tweet_generation_started", {
        topic: topicToUse,
        useGroq: useGroq,
        hasContent: !!contentToUse
      });

      const apiUrl = "/api/generate-tweet";
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topicToUse,
          fullContent: contentToUse || undefined,
          useGroq,
        }),
      });

      console.log('API response:', response.status);
      const data = await response.json();
      console.log('API data:', data);

      if (!response.ok) {
        // Track generation error
        track("tweet_generation_error", {
          topic: topicToUse,
          error: data.error,
          details: data.details
        });

        const errorMessage = data.details 
          ? `Error: ${data.error}. Details: ${data.details}`
          : data.error || "Failed to generate tweet";
        
        if (data.env) {
          const envInfo = `API Keys: ${data.env.hasGroqKey ? '✓' : '✗'} Groq, ${data.env.hasOpenRouterKey ? '✓' : '✗'} OpenRouter. App URL: ${data.env.appUrl}`;
          throw new Error(`${errorMessage}. ${envInfo}`);
        }
        
        throw new Error(errorMessage);
      }

      if (!data.tweet) {
        throw new Error("No tweet was generated. Please try again.");
      }

      setGeneratedTweet(data.tweet);

      // Track successful generation
      track("tweet_generation_success", {
        topic: topicToUse,
        useGroq: useGroq,
        tweetLength: data.tweet.length,
        hasContent: !!contentToUse
      });

    } catch (err) {
      console.error("Tweet generation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate tweet. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTweet = () => {
    if (generatedTweet) {
      navigator.clipboard.writeText(generatedTweet);
      setCopySuccess(true);
      
      // Track tweet copy
      track("tweet_copied", {
        topic: topic,
        tweetLength: generatedTweet.length
      });

      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl border border-default-200 bg-content1 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Generate Viral Tweet</h2>
        <p className="text-default-500">
          Enter any topic to generate an engaging, shareable tweet
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="topic">
            Topic
          </label>
          <Input
            className="w-full"
            id="topic"
            placeholder="e.g., Travel tips, Food trends, Sports news, Business insights"
            radius="sm"
            value={topic}
            variant="bordered"
            onChange={(e) => setTopic(e.target.value)}
          />
          {error && <p className="text-danger text-sm">{error}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Switch isSelected={useGroq} size="sm" onValueChange={setUseGroq} />
          <span className="text-sm">
            Use Groq (faster) - Fallback to OpenRouter if unavailable
          </span>
        </div>

        <Button
          className="w-full"
          color="primary"
          isLoading={isLoading}
          radius="sm"
          variant="shadow"
          onClick={() => handleGenerateTweet()}
        >
          {isLoading ? "Generating..." : "Generate Tweet"}
        </Button>
      </div>

      {generatedTweet && (
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Generated Tweet</h3>
            <Button
              color={copySuccess ? "success" : "secondary"}
              size="sm"
              variant="flat"
              onClick={handleCopyTweet}
            >
              {copySuccess ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="w-full border border-default-200 rounded-lg p-4 bg-default-50 overflow-auto">
            <p className="whitespace-pre-wrap break-words text-default-800">
              {generatedTweet}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-default-400">
        <p>
          <strong>Pro Tip:</strong> For better results, be specific with your
          topic and add context like &quot;for beginners&quot; or &quot;latest trends&quot;.
        </p>
        <p className="mt-2 text-warning-500">
          <strong>Disclaimer:</strong> This is a tweet generation tool only. Always fact-check information and verify sources before sharing. Responsible content sharing is essential for maintaining credibility and preventing misinformation.
        </p>
      </div>
    </div>
  );
};

export default TweetGenerator;
