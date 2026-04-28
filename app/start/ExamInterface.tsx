// components/exam/ExamInterface.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "./Timer";
import { QuestionCard } from "./QuestionCard";
import { submitExam, logCheatingEvent, batchCheatingLogs } from "@/actions/examstart"; 

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
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  
  // Refs for tracking
  const submitLockRef = useRef(false);
  const violationCountRef = useRef(0);
  const lastViolationTimeRef = useRef<Record<string, number>>({});
  
  // Load saved answers
  useEffect(() => {
    const saved = localStorage.getItem(`exam_${registrationId}_answers`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed);
      } catch (e) {}
    }
  }, [registrationId]);

  // Save answers
  const saveAnswers = useCallback((newAnswers: Record<number, string>) => {
    localStorage.setItem(`exam_${registrationId}_answers`, JSON.stringify(newAnswers));
  }, [registrationId]);

  // Simple violation tracker with debounce
  const recordViolation = useCallback(async (type: string) => {
    if (examSubmitted || submitting) return;
    
    // Debounce same violation type (5 seconds)
    const now = Date.now();
    const lastTime = lastViolationTimeRef.current[type] || 0;
    if (now - lastTime < 5000) return;
    
    lastViolationTimeRef.current[type] = now;
    
    // Update count
    const newCount = violationCountRef.current + 1;
    violationCountRef.current = newCount;
    setWarningCount(newCount);
    
    // Send to server
    await logCheatingEvent(registrationId, type);
    
    // Auto-flag after 10 violations (not auto-submit)
    if (newCount >= 10) {
      alert("Your exam has been flagged for review due to multiple violations.");
    }
  }, [registrationId, examSubmitted, submitting]);

  // Simple anti-cheat measures
  useEffect(() => {
    // 1. Block right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation("right_click");
      return false;
    };
    
    // 2. Block copy/paste/cut
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation("copy_paste");
      return false;
    };
    
    // 3. Track tab switches (most important)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation("tab_switch");
      }
    };
    
    // 4. Block F12 and Ctrl+Shift+I
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        recordViolation("devtools");
      }
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C" || e.key === "J")) {
        e.preventDefault();
        recordViolation("devtools");
      }
      if (e.ctrlKey && (e.key === "u" || e.key === "s")) {
        e.preventDefault();
        recordViolation("save_attempt");
      }
    };
    
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [recordViolation]);

  // Fullscreen (simple version)
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (e) {}
    };
    
    enterFullscreen();
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !examSubmitted && !submitting) {
        recordViolation("exit_fullscreen");
        // Try to re-enter
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [recordViolation, examSubmitted, submitting]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!examSubmitted && Object.keys(answers).length > 0) {
        saveAnswers(answers);
        e.preventDefault();
        e.returnValue = "You have unsaved answers. Are you sure?";
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [answers, examSubmitted, saveAnswers]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    saveAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitLockRef.current || examSubmitted || submitting) return;
    
    submitLockRef.current = true;
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("registrationId", registrationId.toString());
      formData.append("answers", JSON.stringify(answers));
      formData.append("warningCount", warningCount.toString());
      
      const result = await submitExam(formData);
      
      if (result.success) {
        localStorage.removeItem(`exam_${registrationId}_answers`);
        setExamSubmitted(true);
        
        // Exit fullscreen
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        
        router.push("/thank-you");
      } else {
        alert(result.error || "Failed to submit exam");
        submitLockRef.current = false;
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit. Please try again.");
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  const handleTimeEnd = () => {
    if (!examSubmitted && !submitting) {
      handleSubmit();
    }
  };

  const progress = questions.length ? (Object.keys(answers).length / questions.length) * 100 : 0;

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Questions Found</h2>
          <p className="text-gray-600">This exam has no questions configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Warning Banner */}
      {warningCount > 0 && warningCount < 10 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white text-center py-2 text-sm">
          ⚠️ Warning: {warningCount} unusual activities detected
        </div>
      )}
      
      {warningCount >= 10 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm">
          ⚠️ Exam flagged for review due to multiple violations
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{examName}</h1>
              <p className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <Timer durationMinutes={durationMinutes} onTimeEnd={handleTimeEnd} />
          </div>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-xl p-4 sticky top-24">
              <h3 className="font-semibold mb-3">Questions</h3>
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
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-100 rounded" />
                    <span>Pending</span>
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

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Previous
              </button>
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-3">Submit Exam?</h2>
            <p className="text-gray-600 mb-6">
              You have answered {Object.keys(answers).length} out of {questions.length} questions.
              {warningCount >= 10 && (
                <span className="block mt-2 text-red-600">
                  Warning: This exam has been flagged for review.
                </span>
              )}
              Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
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