"use client";

import React, { useState } from "react";
import { Microphone, PaperPlaneRight, Sparkle, X } from "@phosphor-icons/react";

interface PromptInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrompt: (prompt: string) => void;
}

export const PromptInputModal: React.FC<PromptInputModalProps> = ({
  isOpen,
  onClose,
  onSubmitPrompt,
}) => {
  const [query, setQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmitPrompt(query.trim());
      setQuery("");
      onClose();
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    onSubmitPrompt(promptText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-fade-slide-up">
      <div className="relative w-full max-w-xl aurora-glass-card p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[var(--aurora-text-muted)] hover:text-[var(--aurora-text-main)] transition-colors"
        >
          <X size={18} weight="bold" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkle size={20} weight="fill" className="text-amber-500 animate-spin" style={{ animationDuration: "8s" }} />
          <h3 className="text-base font-bold text-[var(--aurora-text-main)]">
            Ask William Anything
          </h3>
        </div>


        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question or request..."
            autoFocus
            className="w-full aurora-glass-pill py-3.5 pl-5 pr-24 text-sm text-[var(--aurora-text-main)] placeholder-[var(--aurora-text-muted)] outline-none border focus:border-amber-400 shadow-inner"
          />

          <div className="absolute right-2 top-1.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-full transition-colors ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "hover:bg-black/5 text-[var(--aurora-text-sub)]"
              }`}
              title="Voice Input"
            >
              <Microphone size={18} weight="bold" />
            </button>

            <button
              type="submit"
              disabled={!query.trim()}
              className="p-2 rounded-full bg-[var(--aurora-text-main)] text-[var(--aurora-glass-bg)] hover:opacity-85 disabled:opacity-30 transition-all cursor-pointer"
            >
              <PaperPlaneRight size={18} weight="bold" />
            </button>
          </div>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--aurora-text-muted)]">
            Quick Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickPrompt("How's the Weather today in Lisbon?")}
              className="aurora-glass-pill px-3 py-1.5 text-xs font-medium text-[var(--aurora-text-sub)] hover:text-[var(--aurora-text-main)] hover:border-amber-400 transition-all cursor-pointer"
            >
              🌤️ How's the Weather today in Lisbon?
            </button>
            <button
              onClick={() => handleQuickPrompt("Show my upcoming schedule")}
              className="aurora-glass-pill px-3 py-1.5 text-xs font-medium text-[var(--aurora-text-sub)] hover:text-[var(--aurora-text-main)] hover:border-amber-400 transition-all cursor-pointer"
            >
              📅 Show upcoming meetings
            </button>
            <button
              onClick={() => handleQuickPrompt("How can I assist you today?")}
              className="aurora-glass-pill px-3 py-1.5 text-xs font-medium text-[var(--aurora-text-sub)] hover:text-[var(--aurora-text-main)] hover:border-amber-400 transition-all cursor-pointer"
            >
              ✨ Reset Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
