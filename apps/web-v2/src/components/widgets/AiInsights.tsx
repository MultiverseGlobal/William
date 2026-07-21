"use client";

import React, { useState } from "react";
import { Sparkle, CaretLeft, CaretRight } from "@phosphor-icons/react";

const insightPages = [
  {
    pct: "20%",
    pctSub: "Less productive than usual.",
    taskCompleted: "9/23",
    taskSub: "Tasks completed this week.",
    tip: "Work for 25mins, take 5mins break.",
  },
  {
    pct: "85%",
    pctSub: "Peak focus window: 10AM - 1PM.",
    taskCompleted: "14/23",
    taskSub: "High priority goals tracked.",
    tip: "Drink water and refresh your eyes.",
  },
];

export const AiInsights: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const current = insightPages[pageIndex];

  return (
    <div className="aurora-glass-card p-6 w-full flex flex-col justify-between h-full min-h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-[var(--aurora-text-sub)]">
          <Sparkle size={16} weight="bold" className="text-pink-500 animate-pulse" />
          <span>AI Insights</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPageIndex(0)}
            className={`p-1 rounded-full hover:bg-black/5 ${
              pageIndex === 0 ? "text-[var(--aurora-text-main)] font-bold" : "text-[var(--aurora-text-muted)]"
            }`}
          >
            <CaretLeft size={14} weight="bold" />
          </button>
          <button
            onClick={() => setPageIndex(1)}
            className={`p-1 rounded-full hover:bg-black/5 ${
              pageIndex === 1 ? "text-[var(--aurora-text-main)] font-bold" : "text-[var(--aurora-text-muted)]"
            }`}
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Primary Metric */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-[var(--aurora-text-main)]">
            {current.pct}
          </span>
        </div>
        <p className="text-xs text-[var(--aurora-text-sub)] font-medium">
          {current.pctSub}
        </p>
      </div>

      {/* Progress Line Divider */}
      <div className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden my-3">
        <div
          className="h-full bg-gradient-to-r from-pink-400 to-amber-400 transition-all duration-500"
          style={{ width: pageIndex === 0 ? "35%" : "85%" }}
        />
      </div>

      {/* Secondary Metric */}
      <div className="space-y-1 mb-3">
        <p className="text-lg font-bold text-[var(--aurora-text-main)]">
          {current.taskCompleted}
        </p>
        <p className="text-xs text-[var(--aurora-text-sub)]">
          {current.taskSub}
        </p>
      </div>

      {/* Focus Pill Callout */}
      <div className="aurora-glass-pill px-3.5 py-2 text-[11px] font-medium text-center text-[var(--aurora-text-sub)] shadow-inner">
        {current.tip}
      </div>
    </div>
  );
};
