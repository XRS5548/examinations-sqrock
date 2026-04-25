// components/about/FAQSection.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is ExaminerMax secure?",
    a: "Yes, we use bank-grade encryption, fullscreen proctoring, and advanced anti-cheat measures to ensure exam integrity.",
  },
  {
    q: "Can I conduct subjective exams?",
    a: "Absolutely! We support both MCQ and subjective questions with manual evaluation interface.",
  },
  {
    q: "How are roll numbers generated?",
    a: "Roll numbers are automatically generated based on your company prefix and student ID for uniqueness.",
  },
  {
    q: "What happens if a student cheats?",
    a: "All cheating attempts are logged, and the exam can be flagged for administrator review.",
  },
  {
    q: "Can I integrate with my existing system?",
    a: "Yes, we offer API access for enterprise customers for seamless integration.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-4">
            FAQs
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900 text-left">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}