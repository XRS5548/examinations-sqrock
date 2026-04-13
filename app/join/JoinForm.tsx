// components/exam/JoinForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyStudent } from "@/actions/examstart";

export function JoinForm() {
  const router = useRouter();
  const [rollNumber, setRollNumber] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("rollNumber", rollNumber);
      formData.append("dob", dob);

      const result = await verifyStudent(formData);

      if (result.success) {
        router.push(`/start?examId=${result.examId}&registrationId=${result.registrationId}`);
      } else {
        setError(result.error?.toString() || "Invalid credentials. Please check your Roll Number and Date of Birth.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">EM</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Join Your Exam</h1>
        <p className="text-gray-500 mt-2">Enter your credentials to start the exam</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Roll Number
          </label>
          <input
            type="text"
            id="rollNumber"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
            placeholder="e.g., SQR001"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Start Exam"}
        </button>
      </form>
    </div>
  );
}