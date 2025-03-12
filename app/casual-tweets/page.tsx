"use client";

import React from "react";
import { title, subtitle } from "../../components/primitives";
import CasualTweetGenerator from "../../components/tweet-generator/casual-tweet-generator";

export default function CasualTweetsPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-8 py-6 md:py-8">
      <div className="inline-block max-w-3xl text-center justify-center">
        <h1 className="flex flex-wrap justify-center">
          <span className={title()}>Casual&nbsp;</span>
          <span className={title({ color: "violet" })}>Tweet&nbsp;</span>
          <span className={title()}>Generator</span>
        </h1>
        <div className={subtitle({ class: "mt-4" })}>
          Create relatable, funny tweets that resonate with your audience. Perfect
          for engagement and building authentic connections! 🎯
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <CasualTweetGenerator />
      </div>

      <div className="w-full max-w-3xl p-6 rounded-xl border border-default-200 bg-content1 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Tips for Casual Tweets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-default-50 border border-default-200">
            <h3 className="font-medium mb-2">Keep it Relatable 🤝</h3>
            <p className="text-default-600 text-sm">
              Share common experiences that your audience can instantly connect
              with. The more relatable, the better!
            </p>
          </div>
          <div className="p-4 rounded-lg bg-default-50 border border-default-200">
            <h3 className="font-medium mb-2">Use Natural Emojis 😊</h3>
            <p className="text-default-600 text-sm">
              Add emojis to express emotion, but don't overdo it. One or two well-placed
              emojis can make your tweet more engaging.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-default-50 border border-default-200">
            <h3 className="font-medium mb-2">Keep it Short 📝</h3>
            <p className="text-default-600 text-sm">
              The best casual tweets are short and sweet. Get your point across
              quickly and leave room for engagement.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-default-50 border border-default-200">
            <h3 className="font-medium mb-2">Be Authentic 💫</h3>
            <p className="text-default-600 text-sm">
              Share real thoughts and experiences. Authenticity resonates more than
              perfectly crafted messages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 