// components/exam/Timer.tsx
"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  durationMinutes: number;
  onTimeEnd: () => void;
}

export function Timer({ durationMinutes, onTimeEnd }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeEnd]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isLow = timeLeft < 300; // Less than 5 minutes

  return (
    <div className={`font-mono text-xl font-bold ${isLow ? "text-red-600" : "text-gray-900"}`}>
      {hours > 0 && `${hours}:`}
      {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}