// components/about/MissionSection.tsx
"use client";

import { Shield, Zap, TrendingUp } from "lucide-react";

export function MissionSection() {
  const cards = [
    {
      icon: Shield,
      title: "Security First",
      description: "Bank-grade security with fullscreen proctoring and anti-cheat measures",
    },
    {
      icon: Zap,
      title: "Complete Automation",
      description: "Auto roll generation, instant results, and smart evaluation",
    },
    {
      icon: TrendingUp,
      title: "Enterprise Scale",
      description: "Handle thousands of students with zero downtime",
    },
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="inline-block px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-4">
              Our Mission
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Democratizing Fair & Secure Assessments
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              We believe that every student deserves a fair chance to demonstrate their knowledge. 
              That's why we built a platform that eliminates cheating, automates evaluation, and 
              provides instant results.
            </p>
            <p className="text-lg text-gray-600">
              From small institutes to large enterprises, ExaminerMax scales with your needs while 
              maintaining the highest standards of integrity.
            </p>
          </div>
          
          <div className="grid gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-gray-600">{card.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}