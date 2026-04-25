// app/results/ResultsTable.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";

type Result = {
  id: number;
  examName: string;
  companyName: string;
  resultAnnounced: boolean;
  declaredAt: Date | null;
};

interface ResultsTableProps {
  results: Result[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <p className="text-gray-500">No results declared yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Exam Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Company</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
              <td className="py-3 px-4 text-gray-900 font-medium">{result.examName}</td>
              <td className="py-3 px-4 text-gray-600">{result.companyName}</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  Declared
                </span>
              </td>
              <td className="py-3 px-4 text-gray-500 text-sm">
                {result.declaredAt ? format(new Date(result.declaredAt), "MMM dd, yyyy") : "Recent"}
              </td>
              <td className="py-3 px-4">
                <Link
                  href={`/results?exam=${result.id}`}
                  className="text-red-600 text-sm font-semibold hover:text-red-700 transition"
                >
                  Check →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}