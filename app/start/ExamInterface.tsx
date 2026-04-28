// components/exam/ExamInterface.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "./Timer";
import { QuestionCard } from "./QuestionCard";
import { submitExam, logCheatingEvent, logExamActivity } from "@/actions/examstart"; 

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
  const pendingViolationsRef = useRef<Array<{type: string, timestamp: Date}>>([]);
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const examStartTimeRef = useRef<Date>(new Date());
  const lastAnswerSaveTimeRef = useRef<Date>(new Date());
  const questionViewTimesRef = useRef<Record<number, {start: Date, total: number}>>({});
  
  // Load saved answers
  useEffect(() => {
    const saved = localStorage.getItem(`exam_${registrationId}_answers`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed);
      } catch {
        // Silently handle parse error
      }
    }
    
    // Log exam start
    logExamActivity(registrationId, "start_exam", {
      examId,
      examName,
      durationMinutes,
      totalQuestions: questions.length,
      startTime: examStartTimeRef.current.toISOString()
    }).catch(console.error);
    
    // Start batch interval for cheating logs (every 10 seconds)
    batchIntervalRef.current = setInterval(() => {
      if (pendingViolationsRef.current.length > 0) {
        const violations = [...pendingViolationsRef.current];
        pendingViolationsRef.current = [];
        // Log each violation individually since batch function expects single argument
        for (const violation of violations) {
          logCheatingEvent(registrationId, violation.type).catch(console.error);
        }
      }
    }, 10000);
    
    return () => {
      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
      }
    };
  }, [registrationId, examId, examName, durationMinutes, questions.length]);

  // Save answers with logging
  const saveAnswers = useCallback(async (newAnswers: Record<number, string>, questionId?: number, answer?: string) => {
    localStorage.setItem(`exam_${registrationId}_answers`, JSON.stringify(newAnswers));
    
    // Log answer save activity
    const now = new Date();
    if (questionId && answer !== undefined && (now.getTime() - lastAnswerSaveTimeRef.current.getTime()) > 5000) {
      lastAnswerSaveTimeRef.current = now;
      await logExamActivity(registrationId, "save_answer", {
        questionId,
        answerLength: answer.length,
        totalAnswers: Object.keys(newAnswers).length,
        timestamp: now.toISOString()
      }).catch(console.error);
    }
  }, [registrationId]);

  // Track question view time
  const trackQuestionView = useCallback((questionId: number) => {
    const now = new Date();
    const currentView = questionViewTimesRef.current[questionId];
    if (currentView) {
      // Calculate time spent on previous question
      const timeSpent = now.getTime() - currentView.start.getTime();
      currentView.total += timeSpent;
    }
    // Start new view
    questionViewTimesRef.current[questionId] = {
      start: now,
      total: currentView?.total || 0
    };
  }, []);

  // Log question view on mount and on question change
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      trackQuestionView(questions[currentQuestionIndex].id);
    }
  }, [currentQuestionIndex, questions, trackQuestionView]);

  // Record violation with batch queuing
  const recordViolation = useCallback(async (type: string, details?: Record<string, unknown>) => {
    if (examSubmitted || submitting) return;
    
    // Debounce same violation type (3 seconds)
    const now = Date.now();
    const lastTime = lastViolationTimeRef.current[type] || 0;
    if (now - lastTime < 3000) return;
    
    lastViolationTimeRef.current[type] = now;
    
    // Update count
    const newCount = violationCountRef.current + 1;
    violationCountRef.current = newCount;
    setWarningCount(newCount);
    
    // Add to batch queue
    pendingViolationsRef.current.push({
      type,
      timestamp: new Date()
    });
    
    // Log activity for important violations
    await logExamActivity(registrationId, "cheating_violation", {
      violationType: type,
      violationCount: newCount,
      details: details || {},
      timestamp: new Date().toISOString()
    }).catch(console.error);
    
    // Auto-flag after 10 violations
    if (newCount === 10) {
      await logExamActivity(registrationId, "exam_flagged", {
        violationCount: newCount,
        reason: "Multiple violations detected",
        timestamp: new Date().toISOString()
      }).catch(console.error);
    }
  }, [registrationId, examSubmitted, submitting]);

  // Comprehensive anti-cheat measures
  useEffect(() => {
    // 1. Block right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation("right_click", { target: (e.target as HTMLElement).tagName });
      return false;
    };
    
    // 2. Block copy/paste/cut
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation("copy", { type: e.type });
      return false;
    };
    
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation("paste", { type: e.type });
      return false;
    };
    
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation("cut", { type: e.type });
      return false;
    };
    
    // 3. Track tab switches and visibility
    let visibilityStartTime = Date.now();
    const handleVisibilityChange = () => {
      if (document.hidden) {
        visibilityStartTime = Date.now();
        recordViolation("tab_switch", { action: "hidden" });
      } else {
        const hiddenDuration = Date.now() - visibilityStartTime;
        if (hiddenDuration > 1000) {
          recordViolation("tab_switch_long", { duration: hiddenDuration });
        }
      }
    };
    
    // 4. Track window blur/focus
    const handleBlur = () => {
      recordViolation("window_blur", { timestamp: new Date().toISOString() });
    };
    
    const handleFocus = () => {
      recordViolation("window_focus", { timestamp: new Date().toISOString() });
    };
    
    // 5. Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        recordViolation("devtools_f12");
      }
      // Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C" || e.key === "J")) {
        e.preventDefault();
        recordViolation("devtools_shortcut", { key: e.key });
      }
      // Ctrl+U (view source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        recordViolation("view_source");
      }
      // Ctrl+S (save)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        recordViolation("save_attempt");
      }
      // Ctrl+P (print)
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        recordViolation("print_attempt");
      }
      // Alt+Tab detection (approximate)
      if (e.altKey && e.key === "Tab") {
        recordViolation("alt_tab");
      }
      // Windows key
      if (e.key === "Meta" || e.key === "Win") {
        recordViolation("windows_key");
      }
    };
    
    // 6. Track resize events (potential mobile rotation or devtools)
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const widthDiff = Math.abs(newWidth - lastWidth);
      if (widthDiff > 100) {
        recordViolation("window_resize", { 
          from: lastWidth, 
          to: newWidth,
          timestamp: new Date().toISOString()
        });
        lastWidth = newWidth;
      }
    };
    
    // 7. Track mouse leaving window
    const handleMouseLeave = () => {
      recordViolation("mouse_leave_window");
    };
    
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("blur", handleBlur);
    document.addEventListener("focus", handleFocus);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("blur", handleBlur);
      document.removeEventListener("focus", handleFocus);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [recordViolation]);

  // Fullscreen with better tracking
  useEffect(() => {
    let fullscreenExitTime = 0;
    
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        await logExamActivity(registrationId, "fullscreen_entered", {
          timestamp: new Date().toISOString()
        });
      } catch {
        recordViolation("fullscreen_failed");
      }
    };
    
    enterFullscreen();
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        fullscreenExitTime = Date.now();
        recordViolation("fullscreen_exit");
        
        // Try to re-enter after a short delay
        setTimeout(() => {
          if (!document.fullscreenElement && !examSubmitted && !submitting) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        }, 1000);
      } else {
        if (fullscreenExitTime) {
          const exitDuration = Date.now() - fullscreenExitTime;
          if (exitDuration > 2000) {
            recordViolation("fullscreen_long_exit", { duration: exitDuration });
          }
        }
      }
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [recordViolation, examSubmitted, submitting, registrationId]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (!examSubmitted && Object.keys(answers).length > 0) {
        // Log before unload
        await logExamActivity(registrationId, "before_unload", {
          answersCount: Object.keys(answers).length,
          timestamp: new Date().toISOString()
        }).catch(console.error);
        
        saveAnswers(answers);
        e.preventDefault();
        e.returnValue = "You have unsaved answers. Are you sure?";
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [answers, examSubmitted, saveAnswers, registrationId]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    saveAnswers(newAnswers, questionId, answer);
    
    // Log answer change
    logExamActivity(registrationId, "answer_changed", {
      questionId,
      answerLength: answer.length,
      totalAnswers: Object.keys(newAnswers).length,
      timestamp: new Date().toISOString()
    }).catch(console.error);
  };

  const handleQuestionNavigation = (newIndex: number) => {
    // Log navigation
    logExamActivity(registrationId, "navigate_question", {
      from: currentQuestionIndex + 1,
      to: newIndex + 1,
      timestamp: new Date().toISOString()
    }).catch(console.error);
    
    setCurrentQuestionIndex(newIndex);
  };

  const handleSubmit = async () => {
    if (submitLockRef.current || examSubmitted || submitting) return;
    
    submitLockRef.current = true;
    setSubmitting(true);
    
    // Log exam submission attempt
    await logExamActivity(registrationId, "submit_attempt", {
      totalAnswers: Object.keys(answers).length,
      totalQuestions: questions.length,
      warningCount,
      timeSpent: Date.now() - examStartTimeRef.current.getTime(),
      timestamp: new Date().toISOString()
    }).catch(console.error);
    
    // Send any pending violations before submission
    if (pendingViolationsRef.current.length > 0) {
      for (const violation of pendingViolationsRef.current) {
        await logCheatingEvent(registrationId, violation.type).catch(console.error);
      }
      pendingViolationsRef.current = [];
    }
    
    try {
      const formData = new FormData();
      formData.append("registrationId", registrationId.toString());
      formData.append("answers", JSON.stringify(answers));
      formData.append("warningCount", warningCount.toString());
      
      const result = await submitExam(formData);
      
      if (result.success) {
        // Log successful submission
        await logExamActivity(registrationId, "submit_success", {
          totalAnswers: Object.keys(answers).length,
          totalQuestions: questions.length,
          warningCount,
          totalTimeSpent: Date.now() - examStartTimeRef.current.getTime(),
          timestamp: new Date().toISOString()
        }).catch(console.error);
        
        // Log question-wise time spent
        for (const [qId, timeData] of Object.entries(questionViewTimesRef.current)) {
          await logExamActivity(registrationId, "question_time", {
            questionId: parseInt(qId),
            timeSpentMs: timeData.total,
            timeSpentSeconds: Math.floor(timeData.total / 1000),
            timestamp: new Date().toISOString()
          }).catch(console.error);
        }
        
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
        
        // Log submission failure
        await logExamActivity(registrationId, "submit_failed", {
          error: result.error,
          timestamp: new Date().toISOString()
        }).catch(console.error);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit. Please try again.");
      submitLockRef.current = false;
      setSubmitting(false);
      
      // Log submission error
      await logExamActivity(registrationId, "submit_error", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }).catch(console.error);
    }
  };

  const handleTimeEnd = () => {
    if (!examSubmitted && !submitting) {
      logExamActivity(registrationId, "time_ended", {
        timeSpent: durationMinutes * 60 * 1000,
        timestamp: new Date().toISOString()
      }).catch(console.error);
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
          ⚠️ Exam flagged for review due to multiple violations ({warningCount} incidents)
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
                    onClick={() => handleQuestionNavigation(idx)}
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
                onClick={() => handleQuestionNavigation(Math.max(0, currentQuestionIndex - 1))}
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
                  onClick={() => handleQuestionNavigation(Math.min(questions.length - 1, currentQuestionIndex + 1))}
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
                  ⚠️ Warning: This exam has been flagged for review due to {warningCount} violations.
                </span>
              )}
              Are you sure you want to submit?
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