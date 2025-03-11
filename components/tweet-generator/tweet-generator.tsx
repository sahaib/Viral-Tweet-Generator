"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";

interface TweetGeneratorProps {
  externalTopic?: string;
}

const TweetGenerator: React.FC<TweetGeneratorProps> = ({ externalTopic }) => {
  const [topic, setTopic] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedTweet, setGeneratedTweet] = useState<string>("");
  const [useGroq, setUseGroq] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Effect to update the topic when externalTopic changes
  useEffect(() => {
    if (externalTopic) {
      setTopic(externalTopic);
    }
  }, [externalTopic]);

  const handleGenerateTweet = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          useGroq,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate tweet");
      }

      const data = await response.json();

      setGeneratedTweet(data.tweet);
    } catch (err) {
      setError("Failed to generate tweet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTweet = () => {
    if (generatedTweet) {
      navigator.clipboard.writeText(generatedTweet);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl border border-default-200 bg-content1 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Generate Viral Tweet</h2>
        <p className="text-default-500">
          Enter a topic to generate a viral tweet for tech and AI audiences
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
            placeholder="e.g., AI coding assistants, Web3, Cloud computing"
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
          onClick={handleGenerateTweet}
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
          topic and consider adding context like &quot;for startups&quot; or &quot;for
          developers&quot;.
        </p>
      </div>
    </div>
  );
};

export default TweetGenerator;
