// components/about/PlatformFeatures.tsx
"use client";

import { Monitor, Eye, Hash, Trophy, Brain, Users } from "lucide-react";

const features = [
  {
    icon: Monitor,
    title: "Secure Fullscreen Exams",
    description: "Tab-switch prevention, fullscreen enforcement, and activity logging",
  },
  {
    icon: Eye,
    title: "Anti-Cheat Detection",
    description: "AI-powered cheating detection with comprehensive audit trails",
  },
  {
    icon: Brain,
    title: "Auto Evaluation",
    description: "MCQ auto-grading with instant results and analytics",
  },
  {
    icon: Trophy,
    title: "Subjective Checking",
    description: "Manual evaluation interface with partial marking support",
  },
  {
    icon: Hash,
    title: "Roll Number Automation",
    description: "Custom roll number generation with company prefixes",
  },
  {
    icon: Users,
    title: "Results Management",
    description: "Publish results, generate rank lists, and export data",
  },
];

export function PlatformFeatures() {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-4">
            Platform Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Conduct Exams
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make exam management simple, secure, and scalable
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}