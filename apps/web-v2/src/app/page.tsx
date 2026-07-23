'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraHeader } from '@/components/AuroraHeader';
import { AiOrb } from '@/components/AiOrb';
import { UpcomingSchedule } from '@/components/widgets/UpcomingSchedule';
import { AiInsights } from '@/components/widgets/AiInsights';
import { VacationEligibility } from '@/components/widgets/VacationEligibility';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { PromptInputModal } from '@/components/PromptInputModal';
import { Sparkle, MagnifyingGlass } from '@phosphor-icons/react';

export type NavTab = 'companion' | 'portrait' | 'journeys' | 'library' | 'world' | 'settings';

export default function Home() {

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [orbExpression, setOrbExpression] = useState<'idle' | 'listening' | 'happy' | 'thinking'>('idle');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  const handlePromptSubmit = (prompt: string) => {
    setOrbExpression('thinking');
    setTimeout(() => {
      setActiveQuery(prompt);
      setOrbExpression('happy');
      setTimeout(() => setOrbExpression('idle'), 2000);
    }, 400);
  };

  const resetToDefault = () => {
    setActiveQuery(null);
    setOrbExpression('idle');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[#ECEEF2] text-[#111827] transition-colors duration-300">
      {/* Top Navigation Header */}
      <AuroraHeader
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsModalOpen(true)}
      />

      {/* Main Body Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-6xl mx-auto w-full z-10">
        {/* Dynamic Executive Greeting */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeQuery || 'default-greeting'}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-center mb-10 max-w-2xl"
          >
            {activeQuery ? (
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#111827] font-sans leading-tight">
                {activeQuery}
              </h1>
            ) : (
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-wider uppercase mb-2">
                  Pseudonyms Executive Companion
                </span>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#111827] font-sans">
                  Good Afternoon, Executive
                </h1>
                <p className="text-base md:text-lg font-medium text-gray-500 font-sans max-w-lg mx-auto">
                  William has aligned today's execution plan. 0 schedule conflicts.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Display Area: Executive 3-Card Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl items-stretch"
          >
            <UpcomingSchedule />
            <AiInsights />
            <VacationEligibility />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Interactive AI Orb & Prompt Bar Area */}
      <footer className="w-full flex flex-col items-center justify-center pb-10 pt-4 z-20 space-y-4">
        {/* Interactive Orb */}
        <div className="hover:scale-105 transition-transform cursor-pointer">
          <AiOrb
            expression={orbExpression}
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        {/* Bottom Floating Executive Bar */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-white/90 backdrop-blur-md px-6 py-3 flex items-center gap-3 text-sm font-medium text-gray-700 rounded-full shadow-lg border border-black/5 cursor-pointer transition-all hover:scale-105 active:scale-95"
        >
          <MagnifyingGlass size={18} weight="bold" className="text-blue-600" />
          <span>Tell William what to pull up or tap orb to speak…</span>
          <Sparkle size={16} weight="fill" className="text-amber-500" />
        </div>

      </footer>

      {/* Prompt Modal */}
      <PromptInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitPrompt={handlePromptSubmit}
      />
    </div>
  );
}

