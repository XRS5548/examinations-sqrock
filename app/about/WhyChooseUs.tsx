// components/about/WhyChooseUs.tsx
"use client";

import { Check, X } from "lucide-react";

const comparisons = [
  { feature: "Security", traditional: "Basic", examinerMax: "Bank-grade" },
  { feature: "Anti-Cheat", traditional: "Manual", examinerMax: "AI-powered" },
  { feature: "Result Processing", traditional: "Days", examinerMax: "Instant" },
  { feature: "Scalability", traditional: "Limited", examinerMax: "Enterprise" },
  { feature: "Support", traditional: "Email only", examinerMax: "24/7 Priority" },
];

export function WhyChooseUs() {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-4">
            Why Choose Us
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Traditional Exams vs ExaminerMax
          </h2>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="grid grid-cols-3 bg-gray-100 border-b border-gray-200">
            <div className="p-4 font-semibold text-gray-900">Feature</div>
            <div className="p-4 font-semibold text-gray-900">Traditional Exams</div>
            <div className="p-4 font-semibold text-red-600">ExaminerMax</div>
          </div>
          
          {comparisons.map((item, index) => (
            <div key={index} className="grid grid-cols-3 border-b border-gray-100">
              <div className="p-4 font-medium text-gray-900">{item.feature}</div>
              <div className="p-4 flex items-center gap-2">
                <X className="h-4 w-4 text-red-500" />
                <span className="text-gray-600">{item.traditional}</span>
              </div>
              <div className="p-4 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-gray-900 font-medium">{item.examinerMax}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}