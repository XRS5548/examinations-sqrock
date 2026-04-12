// components/home/NewsTicker.tsx
"use client";

import { useState, useEffect } from "react";

type Announcement = {
  id: number;
  title: string | null;
  description: string | null;
  createdAt: Date | null;
};

interface NewsTickerProps {
  announcements: Announcement[];
}

export function NewsTicker({ announcements }: NewsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);

  if (announcements.length === 0) return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex items-center">
          <div className="absolute left-0 z-10 px-4 bg-gray-100 dark:bg-gray-900">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Breaking</span>
          </div>
          <div 
            className="overflow-hidden ml-24"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className={`whitespace-nowrap py-2 ${!isPaused && "animate-scroll"}`}>
              {announcements.map((ann, idx) => (
                <span key={ann.id} className="inline-block mx-8 text-sm text-gray-600 dark:text-gray-300">
                  {ann.title}
                  {idx < announcements.length - 1 && " •"}
                </span>
              ))}
              {/* Duplicate for seamless loop */}
              {announcements.map((ann, idx) => (
                <span key={`dup-${ann.id}`} className="inline-block mx-8 text-sm text-gray-600 dark:text-gray-300">
                  {ann.title}
                  {idx < announcements.length - 1 && " •"}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>
    </div>
  );
}