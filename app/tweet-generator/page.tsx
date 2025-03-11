"use client";

import React, { useState } from "react";

import { title, subtitle } from "@/components/primitives";
import TweetGenerator from "@/components/tweet-generator/tweet-generator";
import NewsSection from "@/components/tweet-generator/news-section";

export default function TweetGeneratorPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
  };

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-6 md:py-8">
      <div className="inline-block max-w-3xl text-center justify-center">
        <h1 className="flex flex-wrap justify-center">
          <span className={title()}>Viral&nbsp;</span>
          <span className={title({ color: "violet" })}>Tweet&nbsp;</span>
          <span className={title()}>Generator</span>
        </h1>
        <div className={subtitle({ class: "mt-4" })}>
          Create high-engagement tweets that blend curiosity, authenticity, and
          value for any topic or audience.
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <TweetGenerator externalTopic={selectedTopic} />
        </div>
        <div className="lg:col-span-1 order-1 lg:order-2">
          <NewsSection onSelectTopic={handleSelectTopic} />
        </div>
      </div>
    </section>
  );
}
