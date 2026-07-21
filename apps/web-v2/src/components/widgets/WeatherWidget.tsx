"use client";

import React from "react";
import { Cloud, Sun, CloudSun } from "@phosphor-icons/react";

interface WeatherWidgetProps {
  city?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  city = "Lisbon",
}) => {
  return (
    <div className="w-full max-w-xl mx-auto space-y-4 animate-fade-slide-up">
      {/* Overview Main Card */}
      <div className="aurora-glass-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold tracking-tight text-[var(--aurora-text-main)]">
            22°C
          </span>
          <div>
            <h4 className="text-lg font-bold text-[var(--aurora-text-main)]">
              Cloudy
            </h4>
            <p className="text-xs text-[var(--aurora-text-sub)]">
              Will get sunnier as the day progresses in {city}.
            </p>
          </div>
        </div>
        <div className="p-3 bg-amber-500/10 rounded-2xl">
          <CloudSun size={38} weight="duotone" className="text-amber-500 animate-pulse" />
        </div>
      </div>

      {/* Hourly Forecast Pills Row */}
      <div className="aurora-glass-card p-4 flex items-center justify-between gap-2 overflow-x-auto">
        {/* Now */}
        <div className="aurora-glass-pill px-4 py-3 flex flex-col items-center gap-1.5 min-w-[72px] bg-white/90 dark:bg-stone-800 shadow-md">
          <span className="text-[11px] font-bold text-[var(--aurora-text-main)]">Now</span>
          <Cloud size={22} weight="duotone" className="text-stone-400" />
          <span className="text-xs font-bold text-[var(--aurora-text-main)]">22°</span>
        </div>

        {/* 10:00 */}
        <div className="px-3 py-2 flex flex-col items-center gap-1.5 min-w-[64px]">
          <span className="text-[11px] font-medium text-[var(--aurora-text-sub)]">10:00</span>
          <CloudSun size={20} weight="duotone" className="text-amber-400" />
          <span className="text-xs font-bold text-[var(--aurora-text-main)]">22°</span>
        </div>

        {/* 11:00 */}
        <div className="px-3 py-2 flex flex-col items-center gap-1.5 min-w-[64px]">
          <span className="text-[11px] font-medium text-[var(--aurora-text-sub)]">11:00</span>
          <CloudSun size={20} weight="duotone" className="text-amber-500" />
          <span className="text-xs font-bold text-[var(--aurora-text-main)]">23°</span>
        </div>

        {/* 12:00 */}
        <div className="px-3 py-2 flex flex-col items-center gap-1.5 min-w-[64px]">
          <span className="text-[11px] font-medium text-[var(--aurora-text-sub)]">12:00</span>
          <Sun size={20} weight="duotone" className="text-amber-500 animate-spin" style={{ animationDuration: '15s' }} />
          <span className="text-xs font-bold text-[var(--aurora-text-main)]">24°</span>
        </div>

        {/* 13:00 */}
        <div className="px-3 py-2 flex flex-col items-center gap-1.5 min-w-[64px]">
          <span className="text-[11px] font-medium text-[var(--aurora-text-sub)]">13:00</span>
          <Sun size={20} weight="duotone" className="text-orange-500" />
          <span className="text-xs font-bold text-[var(--aurora-text-main)]">26°</span>
        </div>
      </div>
    </div>
  );
};
