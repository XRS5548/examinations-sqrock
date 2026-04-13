// components/exam/QuestionCard.tsx
"use client";

import { useState } from "react";

interface Option {
  id: number;
  optionText: string | null;
}

interface QuestionCardProps {
  question: {
    id: number;
    text: string;
    type: "mcq" | "subjective";
    marks: number;
    options: Option[];
  };
  index: number;
  answer: string | null;
  onAnswerChange: (questionId: number, answer: string) => void;
}

export function QuestionCard({ question, index, answer, onAnswerChange }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>(answer || "");

  const handleOptionChange = (optionId: number) => {
    const answerValue = optionId.toString();
    setSelectedOption(answerValue);
    onAnswerChange(question.id, answerValue);
  };

  const handleTextChange = (value: string) => {
    onAnswerChange(question.id, value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Question {index + 1}: {question.text}
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {question.marks} marks
        </span>
      </div>

      {question.type === "mcq" ? (
        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={selectedOption === option.id.toString()}
                onChange={() => handleOptionChange(option.id)}
                className="w-4 h-4 text-red-600 focus:ring-red-500"
              />
              <span className="text-gray-700">{option.optionText}</span>
            </label>
          ))}
        </div>
      ) : (
        <div>
          <textarea
            rows={5}
            value={answer || ""}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-y"
            placeholder="Write your answer here..."
          />
        </div>
      )}
    </div>
  );
}