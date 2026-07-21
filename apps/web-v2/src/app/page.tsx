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
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
      {/* Top Navigation Header */}
      <AuroraHeader
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsModalOpen(true)}
      />

      {/* Main Body Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-6xl mx-auto w-full z-10">
        {/* Dynamic Animated Greeting / Headline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeQuery || 'default-greeting'}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-center mb-8 max-w-2xl"
          >
            {activeQuery ? (
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--aurora-text-main)] font-sans leading-tight">
                {activeQuery}
              </h1>
            ) : (
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--aurora-text-main)] font-sans">
                  Good Morning, Ayoub!
                </h1>
                <p className="text-2xl md:text-4xl font-semibold text-[var(--aurora-text-main)] opacity-90 font-sans">
                  How can I assist you today?
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Display Area */}
        <AnimatePresence mode="wait">
          {activeQuery && activeQuery.toLowerCase().includes('weather') ? (
            /* Weather Response View */
            <motion.div
              key="weather-view"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              <WeatherWidget city="Lisbon" />
              <button
                onClick={resetToDefault}
                className="mt-6 aurora-glass-pill px-4 py-2 text-xs font-semibold text-[var(--aurora-text-sub)] hover:text-[var(--aurora-text-main)] transition-colors cursor-pointer"
              >
                ← Back to Dashboard
              </button>
            </motion.div>
          ) : (
            /* Default Dashboard 3-Card Grid */
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
          )}
        </AnimatePresence>
      </main>

      {/* Interactive AI Orb & Prompt Bar Area */}
      <footer className="w-full flex flex-col items-center justify-center pb-8 pt-4 z-20 space-y-4">
        {/* Interactive Orb */}
        <div className="hover:scale-105 transition-transform">
          <AiOrb
            expression={orbExpression}
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        {/* Bottom Floating Bar */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="aurora-glass-pill px-5 py-2.5 flex items-center gap-3 text-xs font-medium text-[var(--aurora-text-sub)] hover:text-[var(--aurora-text-main)] shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 border border-[var(--aurora-glass-border)]"
        >
          <MagnifyingGlass size={16} weight="bold" className="text-amber-500" />
          <span>Ask William or tap orb to speak…</span>
          <Sparkle size={14} weight="fill" className="text-pink-400" />
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

