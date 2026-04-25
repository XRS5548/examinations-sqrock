// components/results/ResultSearchForm.tsx
"use client";

import { useState, useRef } from "react";
import { searchStudentResult } from "@/actions/results-public";

interface ResultData {
  id: number;
  rollNumber: string;
  studentName: string;
  studentEmail: string;
  examName: string;
  examTotalMarks: number;
  score: number;
  percentage: number;
  cheating: boolean;
  submittedAt: Date;
  rank?: number;
}

export function ResultSearchForm() {
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("rollNumber", rollNumber);
      formData.append("email", email);

      const data = await searchStudentResult(formData);
      
      if (data.success && data.result) {
        // Transform the result to ensure no null values
        const transformedResult: ResultData = {
          id: data.result.id,
          rollNumber: data.result.rollNumber || "N/A",
          studentName: data.result.studentName || "N/A",
          studentEmail: data.result.studentEmail,
          examName: data.result.examName || "Unknown Exam",
          examTotalMarks: data.result.examTotalMarks,
          score: data.result.score,
          percentage: data.result.percentage,
          cheating: data.result.cheating,
          submittedAt: data.result.submittedAt || new Date(),
          rank: data.result.rank || undefined,
        };
        setResult(transformedResult);
      } else {
        setError(data.error?.toString() || "No result found. Please check your credentials.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultRef.current) return;
    
    setDownloading(true);
    try {
      // Dynamically import html2canvas and jspdf
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      
      const element = resultRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const xPosition = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      let yPosition = 10;
      
      if (imgHeight <= pageHeight - 20) {
        yPosition = (pageHeight - imgHeight) / 2;
      }
      
      pdf.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight);
      pdf.save(`Result_${result?.rollNumber}_${result?.examName?.replace(/\s/g, "_")}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to download result. Please try again or take a screenshot.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      {/* Search Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Find Your Result</h2>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roll Number *
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="Enter your roll number"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="student@example.com"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Check Result →"}
          </button>
        </form>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {error}
          </div>
        )}
      </div>
      
      {/* Result Card */}
      {result && (
        <div ref={resultRef}>
          <div className="bg-white border-2 border-red-200 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Result Card</h3>
                  <p className="text-sm text-red-100">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {downloading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Student Name</p>
                  <p className="text-lg font-semibold text-gray-900">{result.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Roll Number</p>
                  <p className="text-lg font-semibold text-gray-900">{result.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-lg font-semibold text-gray-900">{result.studentEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exam Name</p>
                  <p className="text-lg font-semibold text-gray-900">{result.examName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted On</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(result.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-3xl font-bold text-gray-900">{result.score}</p>
                    <p className="text-sm text-gray-500 mt-1">Score</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-3xl font-bold text-gray-900">{result.percentage.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500 mt-1">Percentage</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-3xl font-bold text-gray-900">{result.rank || "N/A"}</p>
                    <p className="text-sm text-gray-500 mt-1">Rank</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div>
                  {result.cheating ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      ⚠️ Cheating Detected
                    </span>
                  ) : result.percentage >= 40 ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      ✅ Pass
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      ❌ Fail
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {result.score} / {result.examTotalMarks} marks
                </div>
              </div>
            </div>
            
            {/* Watermark for authenticity */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">
                This is a computer-generated document. No signature is required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}