"use client";

import React, { useState } from "react";
import { CalendarBlank, Check, Plus } from "@phosphor-icons/react";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  completed: boolean;
}

const initialSchedule: ScheduleItem[] = [
  {
    id: "1",
    time: "10:00 AM",
    title: "Meeting with John",
    location: "Conference Room A",
    completed: false,
  },
  {
    id: "2",
    time: "11:30 AM",
    title: "Team Lunch",
    location: "Le Marley, Casablanca",
    completed: false,
  },
  {
    id: "3",
    time: "12:45 PM",
    title: "Submit final report",
    location: "Le Marley, Casablanca",
    completed: false,
  },
];

export const UpcomingSchedule: React.FC = () => {
  const [items, setItems] = useState<ScheduleItem[]>(initialSchedule);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="aurora-glass-card p-6 w-full flex flex-col justify-between h-full min-h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-[var(--aurora-text-sub)]">
          <CalendarBlank size={16} weight="bold" className="text-[var(--aurora-text-muted)]" />
          <span>Upcoming</span>
        </div>
        <button
          onClick={() => {
            const newTitle = prompt("Enter event title:");
            if (newTitle) {
              setItems([
                ...items,
                {
                  id: Date.now().toString(),
                  time: "02:00 PM",
                  title: newTitle,
                  location: "Virtual Meeting",
                  completed: false,
                },
              ]);
            }
          }}
          className="p-1 rounded-full hover:bg-black/5 text-[var(--aurora-text-muted)] hover:text-[var(--aurora-text-main)] transition-colors"
          title="Add Event"
        >
          <Plus size={16} weight="bold" />
        </button>
      </div>

      {/* Item List */}
      <div className="space-y-3.5 flex-1">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`group flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-all ${
              item.completed ? "opacity-45" : "hover:bg-white/40 dark:hover:bg-white/5"
            }`}
          >
            {/* Left Accent Bar */}
            <div
              className={`w-1 h-8 rounded-full transition-colors mt-0.5 ${
                item.completed
                  ? "bg-emerald-500"
                  : "bg-stone-800 dark:bg-stone-200 group-hover:bg-orange-500"
              }`}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p
                  className={`text-xs font-bold text-[var(--aurora-text-main)] truncate ${
                    item.completed ? "line-through" : ""
                  }`}
                >
                  {item.time} <span className="font-semibold">• {item.title}</span>
                </p>
                {item.completed && <Check size={14} className="text-emerald-500" />}
              </div>
              <p className="text-[11px] text-[var(--aurora-text-sub)] mt-0.5 truncate">
                {item.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
