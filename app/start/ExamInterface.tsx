// components/exam/ExamInterface.tsx (updated with anti-cheat system)
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "./Timer";
import { QuestionCard } from "./QuestionCard";
import { submitExam, logCheatingEvent } from "@/actions/examstart";

interface Option {
  id: number;
  questionId: number;
  optionText: string | null;
  isCorrect: boolean | null;
}

interface Question {
  id: number;
  text: string;
  type: "mcq" | "subjective";
  marks: number;
  options: Option[];
}

interface ExamInterfaceProps {
  examId: number;
  registrationId: number;
  examName: string;
  durationMinutes: number;
  questions: Question[];
}

export function ExamInterface({
  examId,
  registrationId,
  examName,
  durationMinutes,
  questions,
}: ExamInterfaceProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Anti-cheat: Prevent copy, cut, paste
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatingEvent(registrationId, "copy_attempt");
      setWarningCount(prev => prev + 1);
      alert("Copying is not allowed during the exam!");
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatingEvent(registrationId, "cut_attempt");
      setWarningCount(prev => prev + 1);
      alert("Cutting is not allowed during the exam!");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatingEvent(registrationId, "paste_attempt");
      setWarningCount(prev => prev + 1);
      alert("Pasting is not allowed during the exam!");
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
    };
  }, [registrationId]);

  // Anti-cheat: Prevent right click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logCheatingEvent(registrationId, "right_click_attempt");
      setWarningCount(prev => prev + 1);
      return false;
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [registrationId]);

  // Anti-cheat: Prevent keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, F12, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === "F12") {
        e.preventDefault();
        logCheatingEvent(registrationId, "devtools_attempt");
        setWarningCount(prev => prev + 1);
        alert("Developer tools are not allowed!");
        return false;
      }

      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) {
        e.preventDefault();
        logCheatingEvent(registrationId, "devtools_attempt");
        setWarningCount(prev => prev + 1);
        alert("Developer tools are not allowed!");
        return false;
      }

      // Prevent Ctrl+U (view source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        logCheatingEvent(registrationId, "view_source_attempt");
        setWarningCount(prev => prev + 1);
        alert("View source is not allowed!");
        return false;
      }

      // Prevent Ctrl+P (print)
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        logCheatingEvent(registrationId, "print_attempt");
        setWarningCount(prev => prev + 1);
        alert("Printing is not allowed during the exam!");
        return false;
      }

      // Prevent Ctrl+S (save)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        logCheatingEvent(registrationId, "save_attempt");
        setWarningCount(prev => prev + 1);
        alert("Saving is not allowed during the exam!");
        return false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [registrationId]);

  // Fullscreen mode
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.error("Fullscreen error:", error);
        alert("Please allow fullscreen to start the exam.");
      }
    };

    requestFullscreen();

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      
      if (!isFull && isVisible) {
        logCheatingEvent(registrationId, "exit_fullscreen");
        setWarningCount(prev => prev + 1);
        alert("Exiting fullscreen is not allowed! You will be warned.");
        
        // Re-enter fullscreen if exited
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [registrationId, isVisible]);

  // Anti-cheat: Tab visibility change (switching tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
        logCheatingEvent(registrationId, "tab_switch");
        setWarningCount(prev => prev + 1);
        alert("Tab switching is not allowed during the exam!");
      } else {
        setIsVisible(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [registrationId]);

  // Anti-cheat: Window blur (clicking outside)
  useEffect(() => {
    const handleBlur = () => {
      logCheatingEvent(registrationId, "window_blur");
      setWarningCount(prev => prev + 1);
      alert("Please stay on the exam window!");
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [registrationId]);

  // Auto-submit if too many warnings (5 warnings)
  useEffect(() => {
    if (warningCount >= 5) {
      alert("Too many cheating attempts! Your exam will be submitted automatically.");
      handleSubmit();
    }
  }, [warningCount]);

  // Save answers to localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`exam_${registrationId}_answers`);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved answers");
      }
    }
  }, [registrationId]);

  const saveAnswers = (newAnswers: Record<number, string>) => {
    localStorage.setItem(`exam_${registrationId}_answers`, JSON.stringify(newAnswers));
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    saveAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("registrationId", registrationId.toString());
      formData.append("answers", JSON.stringify(answers));

      const result = await submitExam(formData);

      if (result.success) {
        localStorage.removeItem(`exam_${registrationId}_answers`);
        
        // Exit fullscreen
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        
        router.push("/thank-you");
      } else {
        alert(result.error || "Failed to submit exam");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleTimeEnd = () => {
    handleSubmit();
  };

  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Found</h2>
          <p className="text-gray-600">This exam has no questions configured yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50">
      {/* Warning Banner */}
      {warningCount > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm font-medium">
          ⚠️ Warning: {warningCount}/5 cheating attempts detected. Your exam will be auto-submitted after 5 attempts.
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{examName}</h1>
              <p className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <Timer durationMinutes={durationMinutes} onTimeEnd={handleTimeEnd} />
          </div>
          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-10 h-10 rounded-lg font-medium transition ${
                      currentQuestionIndex === idx
                        ? "bg-red-600 text-white"
                        : answers[q.id]
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-100 rounded" />
                    <span className="text-gray-600">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Question */}
          <div className="lg:col-span-3">
            <QuestionCard
              question={questions[currentQuestionIndex]}
              index={currentQuestionIndex}
              answer={answers[questions[currentQuestionIndex]?.id] || null}
              onAnswerChange={handleAnswerChange}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Warning Overlay */}
      {!isFullscreen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center text-white p-8">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Fullscreen Required</h2>
            <p className="text-gray-300 mb-4">Please enter fullscreen mode to continue the exam.</p>
            <button
              onClick={() => document.documentElement.requestFullscreen()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Submit Exam?</h2>
            <p className="text-gray-600 mb-6">
              You have answered {Object.keys(answers).length} out of {questions.length} questions.
              Are you sure you want to submit?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}