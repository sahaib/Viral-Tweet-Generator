"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";

const topics = [
  "social media addiction",
  "monday mornings",
  "coffee addiction",
  "online shopping",
  "netflix binge",
  "gym motivation",
  "phone battery",
  "zoom meetings",
  "instagram filters",
  "food delivery",
];

export default function CasualTweetGenerator() {
  const [topic, setTopic] = useState("");
  const [generatedTweet, setGeneratedTweet] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [useGroq, setUseGroq] = useState(true);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  const handleGenerateTweet = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    if (!hasAcceptedDisclaimer) {
      setError("Please accept the content disclaimer before generating tweets");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-casual-tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          topic: topic.trim(),
          useGroq: useGroq 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate tweet");
      }

      const data = await response.json();
      setGeneratedTweet(data.tweet);

      // Track successful generation
      track("casual_tweet_generated", {
        topic: topic.trim(),
        model: useGroq ? "groq" : "openrouter",
      });
    } catch (err) {
      setError("Failed to generate tweet. Please try again.");
      console.error("Tweet generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = (selectedTopic: string) => {
    setTopic(selectedTopic);
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl border border-default-200 bg-content1 shadow-sm">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Casual Tweet Generator</h2>
        <p className="text-default-500">
          Generate relatable, funny tweets about everyday situations. Perfect for
          engagement and relatability! 🚀
        </p>
      </div>

      <div className="p-4 rounded-lg bg-warning-50 border border-warning-200">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-1 rounded-full bg-warning-200">
            <svg
              className="w-4 h-4 text-warning-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-semibold text-warning-800 mb-1">Content Disclaimer</h3>
            <p className="text-sm text-warning-700 mb-3">
              This tool uses AI to generate tweets that may occasionally contain mature or controversial content. 
              By using this tool, you acknowledge that:
            </p>
            <ul className="list-disc list-inside text-sm text-warning-700 space-y-1 mb-3">
              <li>Generated content may include adult themes or language</li>
              <li>You are responsible for reviewing and editing content before posting</li>
              <li>You will not intentionally generate harmful or inappropriate content</li>
              <li>You are at least 18 years old or have parental consent</li>
            </ul>
            <div className="flex items-center gap-2">
              <Switch
                isSelected={hasAcceptedDisclaimer}
                onValueChange={setHasAcceptedDisclaimer}
                size="sm"
              />
              <label className="text-sm text-warning-800 font-medium">
                I understand and accept these terms
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-default-700">Model:</span>
            <Switch
              isSelected={useGroq}
              onValueChange={setUseGroq}
              size="sm"
              color="secondary"
            >
              <div className="flex items-center gap-2">
                <span className={useGroq ? "text-secondary" : "text-default-500"}>
                  {useGroq ? "Groq (Faster)" : "OpenRouter (Backup)"}
                </span>
              </div>
            </Switch>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTopicClick(t)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                topic === t
                  ? "bg-primary text-white"
                  : "bg-default-100 hover:bg-default-200 text-default-700"
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Enter a topic (e.g., social media, coffee addiction)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-grow"
          />
          <Button
            color="primary"
            isLoading={isLoading}
            onClick={handleGenerateTweet}
          >
            Generate
          </Button>
        </div>

        {error && (
          <div className="text-danger text-sm p-4 rounded-lg bg-danger-50 border border-danger-200">
            {error}
          </div>
        )}

        {generatedTweet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 border border-default-200 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    𝕏
                  </motion.div>
                  <div className="mt-2 flex flex-col items-center">
                    <motion.div
                      className="w-1 h-1 rounded-full bg-primary/30 my-1"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-1 h-1 rounded-full bg-secondary/30 my-1"
                      animate={{ scale: [1.2, 1, 1.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-1 h-1 rounded-full bg-primary/30 my-1"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-default-900">Tweet Preview</h3>
                      <p className="text-default-500 text-sm">Generated just now</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full bg-default-100 hover:bg-default-200 transition-colors"
                        onClick={handleGenerateTweet}
                      >
                        <svg
                          className="w-5 h-5 text-default-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full bg-default-100 hover:bg-default-200 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedTweet);
                          track("casual_tweet_copied");
                        }}
                      >
                        <svg
                          className="w-5 h-5 text-default-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full bg-default-100 hover:bg-default-200 transition-colors"
                        onClick={() => {
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedTweet)}`, '_blank');
                          track("casual_tweet_shared");
                        }}
                      >
                        <svg
                          className="w-5 h-5 text-default-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/20 via-secondary/20 to-primary/20" />
                    <p className="text-lg leading-relaxed">{generatedTweet}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-default-500">
                    <motion.div
                      className="flex items-center gap-1 text-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>0</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-1 text-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>0</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-1 text-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>0</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 