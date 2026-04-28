// components/exam/QuestionCard.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";

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
  allowPaste?: boolean;
  showWordCount?: boolean;
}

export function QuestionCard({ 
  question, 
  index, 
  answer, 
  onAnswerChange,
  allowPaste = false,
  showWordCount = true
}: QuestionCardProps) {
  // Initialize state directly from props (lazy initialization)
  const [selectedOption, setSelectedOption] = useState<string  >(() => {
    if (question.type === "mcq" && answer) {
      return answer;
    }
    return "";
  });
  
  const [localAnswer, setLocalAnswer] = useState<string>(() => {
    if (question.type === "subjective" && answer) {
      return answer;
    }
    return "";
  });
  
  const [wordCount, setWordCount] = useState<number>(() => {
    if (question.type === "subjective" && answer) {
      return answer.trim() === "" ? 0 : answer.trim().split(/\s+/).length;
    }
    return 0;
  });
  
  const [charCount, setCharCount] = useState<number>(() => {
    if (question.type === "subjective" && answer) {
      return answer.length;
    }
    return 0;
  });
  
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevAnswerRef = useRef<string | null>(answer);
  const isFirstRender = useRef(true);

  const updateCounts = useCallback((text: string) => {
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    setWordCount(words);
    setCharCount(text.length);
  }, []);

  // Sync with external answer changes (only when answer actually changes)
  useEffect(() => {
    // Skip on first render since we already initialized with answer
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevAnswerRef.current = answer;
      return;
    }
    
    // Don't update if answer is same as before
    if (answer === prevAnswerRef.current) return;
    prevAnswerRef.current = answer;
    
    if (answer !== undefined && answer !== null) {
      if (question.type === "mcq") {
        setSelectedOption(answer);
      } else if (question.type === "subjective") {
        setLocalAnswer(answer);
        updateCounts(answer);
      }
    }
  }, [answer, question.type, updateCounts]);

  const handleOptionChange = useCallback((optionId: number) => {
    const answerValue = optionId.toString();
    setSelectedOption(answerValue);
    onAnswerChange(question.id, answerValue);
  }, [question.id, onAnswerChange]);

  const handleTextChange = useCallback((value: string) => {
    setLocalAnswer(value);
    updateCounts(value);
    
    // Debounce the save to parent component
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onAnswerChange(question.id, value);
    }, 500);
  }, [question.id, onAnswerChange, updateCounts]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!allowPaste) {
      e.preventDefault();
      
      const warningMessage = "Pasting is disabled for this question type to maintain exam integrity.";
      
      // Create toast notification
      const toast = document.createElement("div");
      toast.textContent = warningMessage;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #f59e0b;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      return false;
    }
    
    // For allowed paste, update counts after paste
    setTimeout(() => {
      const pastedValue = textareaRef.current?.value || "";
      updateCounts(pastedValue);
    }, 10);
  }, [allowPaste, updateCounts]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!allowPaste) {
      // Block Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        return false;
      }
    }
  }, [allowPaste]);

  const clearAnswer = useCallback(() => {
    if (confirm("Are you sure you want to clear your answer?")) {
      setLocalAnswer("");
      setSelectedOption("");
      updateCounts("");
      onAnswerChange(question.id, "");
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [question.id, onAnswerChange, updateCounts]);

  const clearMCQSelection = useCallback(() => {
    setSelectedOption("");
    onAnswerChange(question.id, "");
  }, [question.id, onAnswerChange]);

  // Add CSS animation for toast (only once)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
              Question {index + 1}
            </span>
            {question.type === "subjective" && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Subjective
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {question.text}
          </h3>
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </span>
      </div>

      {question.type === "mcq" ? (
        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                selectedOption === option.id.toString()
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={selectedOption === option.id.toString()}
                onChange={() => handleOptionChange(option.id)}
                className="w-4 h-4 text-red-600 focus:ring-red-500"
                aria-label={`Option ${option.id}`}
              />
              <span className="text-gray-700 flex-1">{option.optionText}</span>
              {selectedOption === option.id.toString() && (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </label>
          ))}
          
          {/* Clear selection button for MCQ */}
          {selectedOption && (
            <button
              onClick={clearMCQSelection}
              className="text-sm text-red-600 hover:text-red-700 mt-2 transition"
              type="button"
            >
              Clear selection
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={8}
              value={localAnswer}
              onChange={(e) => handleTextChange(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-y transition ${
                isFocused ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Write your answer here... (Be detailed and specific)"
              aria-label="Your answer"
            />
            
            {/* Word/Character Counter */}
            {showWordCount && localAnswer && (
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/90 px-2 py-1 rounded">
                {wordCount} {wordCount === 1 ? "word" : "words"} • {charCount} characters
              </div>
            )}
          </div>
          
          {/* Action buttons for subjective answers */}
          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-gray-500">
              {!allowPaste && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Copy/paste is disabled for exam integrity
                </span>
              )}
              {allowPaste && (
                <span className="flex items-center gap-1 text-green-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Pasting is allowed for this answer
                </span>
              )}
            </div>
            
            {localAnswer && (
              <button
                onClick={clearAnswer}
                className="text-xs text-red-600 hover:text-red-700 transition"
                type="button"
              >
                Clear answer
              </button>
            )}
          </div>
          
          {/* Tips for subjective answers */}
          {question.type === "subjective" && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-800">
                <strong>💡 Tip:</strong> Write a clear, well-structured answer. Include relevant examples and explanations to maximize your marks.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Answer status indicator */}
      {(selectedOption || localAnswer) && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Answer saved
          </p>
        </div>
      )}
    </div>
  );
}