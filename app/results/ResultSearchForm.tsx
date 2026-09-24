"use client";

import { useState } from "react";
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  Download,
  Loader2,
  Mail,
  Search,
  TrendingUp,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { searchStudentResult } from "@/actions/results-public";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PublicResultData = {
  id: number;
  rollNumber: string;
  studentName: string;
  studentEmail: string;
  examName: string;
  examTotalMarks: number;
  score: number;
  percentage: number;
  cheating: boolean;
  submittedAt: string;
  rank: number | null;
  passingScore: number;
};

interface ResultSearchFormProps {
  initialRollNumber?: string;
  initialEmail?: string;
  initialResult?: PublicResultData | null;
  initialError?: string;
}

function formatSubmittedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
}

export function ResultSearchForm({
  initialRollNumber = "",
  initialEmail = "",
  initialResult = null,
  initialError = "",
}: ResultSearchFormProps) {
  const [rollNumber, setRollNumber] = useState(initialRollNumber);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<PublicResultData | null>(initialResult);
  const [error, setError] = useState(initialError);

  const searchResult = async (
    searchRollNumber: string,
    searchEmail: string
  ) => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("rollNumber", searchRollNumber);
      formData.append("email", searchEmail);
      const data = await searchStudentResult(formData);

      if (data.success && data.result) {
        setResult({
          id: data.result.id,
          rollNumber: data.result.rollNumber || "N/A",
          studentName: data.result.studentName || "N/A",
          studentEmail: data.result.studentEmail,
          examName: data.result.examName || "Unknown Exam",
          examTotalMarks: data.result.examTotalMarks,
          score: data.result.score,
          percentage: data.result.percentage,
          cheating: data.result.cheating,
          submittedAt: data.result.submittedAt
            ? new Date(data.result.submittedAt).toISOString()
            : new Date().toISOString(),
          rank: data.result.rank,
          passingScore: data.result.passingScore,
        });
      } else {
        setResult(null);
        setError(
          typeof data.error === "string"
            ? data.error
            : "No result found. Please check your credentials."
        );
      }
    } catch {
      setResult(null);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResult = async () => {
    if (!result || isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch("/api/results/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: result.rollNumber,
          email: result.studentEmail,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to download result");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Result-${result.rollNumber}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to download result"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await searchResult(rollNumber, email);
  };

  return (
    <div>
      <Card className="border-0 shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50">
        <CardHeader className="text-center border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Find Your Result
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your roll number and email to view your result
          </p>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-w-md mx-auto"
          >
            <div className="space-y-2">
              <Label
                htmlFor="rollNumber"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <User className="h-4 w-4 text-blue-500" />
                Roll Number *
              </Label>
              <Input
                id="rollNumber"
                type="text"
                value={rollNumber}
                onChange={(event) => setRollNumber(event.target.value)}
                placeholder="Enter your roll number"
                className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-purple-500" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@example.com"
                className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-6 text-lg rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Check Result →
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>

        <div className="bg-gray-50 dark:bg-gray-800/30 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            This is a computer-generated result. No signature is required.
          </p>
        </div>
      </Card>

      {result && (
        <div className="mt-8">
          <Card className="border-2 border-red-200 dark:border-red-800/50 shadow-2xl shadow-red-500/10 dark:shadow-red-900/20 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6" />
                    <h3 className="text-xl font-bold">Result Card</h3>
                  </div>
                  <p className="text-sm text-red-100 mt-1">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={handleDownloadResult}
                  disabled={isDownloading}
                  variant="secondary"
                  className="bg-white text-red-700 hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isDownloading ? "Generating PDF..." : "Download PDF"}
                </Button>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Student Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {result.studentName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Roll Number
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                    {result.rollNumber}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    Email Address
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {result.studentEmail}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    Exam Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {result.examName}
                  </p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Submitted On
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatSubmittedAt(result.submittedAt)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {result.score}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Score
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {result.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Percentage
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {result.rank || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Rank
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {result.cheating ? (
                    <Badge variant="destructive" className="px-3 py-1.5 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1.5" />
                      Cheating Detected
                    </Badge>
                  ) : result.score >= result.passingScore ? (
                    <Badge className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Pass
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="px-3 py-1.5 text-sm">
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Fail
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {result.score} / {result.examTotalMarks} marks
                </div>
              </div>
            </CardContent>

            <div className="bg-gray-50 dark:bg-gray-800/30 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                This is a computer-generated result. No signature is required.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
