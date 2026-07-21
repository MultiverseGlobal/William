"use client";

import React, { useState } from "react";

interface AiOrbProps {
  expression?: "idle" | "listening" | "happy" | "thinking";
  onClick?: () => void;
}

export const AiOrb: React.FC<AiOrbProps> = ({
  expression = "idle",
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Render facial eyes/mouth based on current state
  const renderFace = () => {
    switch (expression) {
      case "listening":
        return (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-stone-800 rounded-full animate-bounce" />
            <span className="w-1.5 h-3 bg-stone-800 rounded-full animate-bounce delay-100" />
          </div>
        );
      case "happy":
        return (
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
            <span>^</span>
            <span>^</span>
          </div>
        );
      case "thinking":
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-stone-800 rounded-full animate-ping" />
            <span className="w-1.5 h-1.5 bg-stone-800 rounded-full animate-ping delay-150" />
          </div>
        );
      case "idle":
      default:
        return (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-stone-800/80 rounded-full transition-transform duration-200" />
            <span className="w-1.5 h-3 bg-stone-800/80 rounded-full transition-transform duration-200" />
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center justify-center cursor-pointer group"
    >
      {/* Outer Rotating Glowing Aura */}
      <div className="aurora-orb-aura" />

      {/* Ripple Rings */}
      <div className="absolute inset-0 rounded-full border border-pink-300/40 animate-ping opacity-25" />
      <div className="absolute -inset-4 rounded-full border border-purple-300/30 animate-pulse" />

      {/* Core Glowing Orb */}
      <div
        className={`w-28 h-28 md:w-36 md:h-36 aurora-orb flex items-center justify-center z-10 transition-transform duration-300 ${
          isHovered ? "scale-110" : "scale-100"
        }`}
      >
        {/* Soft highlight overlay */}
        <div className="absolute top-3 left-4 w-8 h-8 rounded-full bg-white/40 blur-sm pointer-events-none" />

        {/* Expressive Face Elements */}
        <div className="z-20 transition-all duration-300 transform group-hover:scale-110">
          {renderFace()}
        </div>
      </div>
    </div>
  );
};
