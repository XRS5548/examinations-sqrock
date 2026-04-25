// app/results/LatestDeclaredResults.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";

type Result = {
  id: number;
  examName: string;
  companyName: string;
  declaredAt: Date | null;
};

interface LatestDeclaredResultsProps {
  results: Result[];
}

export function LatestDeclaredResults({ results }: LatestDeclaredResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
        <p className="text-gray-500">No results declared yet</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {results.map((result) => (
        <div
          key={result.id}
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{result.examName}</h3>
              <p className="text-sm text-gray-500">{result.companyName}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">
              Declared: {result.declaredAt ? format(new Date(result.declaredAt), "MMM dd, yyyy") : "Recently"}
            </p>
            <Link
              href={`/results?exam=${result.id}`}
              className="text-red-600 text-sm font-semibold hover:text-red-700 transition"
            >
              View Results →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}