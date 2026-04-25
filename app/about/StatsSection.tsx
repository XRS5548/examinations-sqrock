// components/about/StatsSection.tsx
"use client";

import { useEffect, useState } from "react";

interface Stats {
  companies: number;
  students: number;
  exams: number;
}

interface StatsSectionProps {
  stats: Stats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  const [counts, setCounts] = useState({
    companies: 0,
    students: 0,
    exams: 0,
  });

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounts({
        companies: Math.min(Math.floor((step / steps) * stats.companies), stats.companies),
        students: Math.min(Math.floor((step / steps) * stats.students), stats.students),
        exams: Math.min(Math.floor((step / steps) * stats.exams), stats.exams),
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [stats]);

  const statCards = [
    { label: "Companies", value: counts.companies, suffix: "+" },
    { label: "Students", value: counts.students.toLocaleString(), suffix: "+" },
    { label: "Exams Conducted", value: counts.exams, suffix: "+" },
    { label: "Uptime", value: 99.9, suffix: "%" },
  ];

  return (
    <div className="py-16 bg-gradient-to-r from-red-600 to-red-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {statCards.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="text-4xl sm:text-5xl font-bold mb-2">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-red-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}