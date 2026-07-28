// app/results/ResultsTable.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Eye, Building2, Calendar, CheckCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <Card className="border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No results declared yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for updates</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Exam Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((result) => (
              <tr 
                key={result.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {result.examName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                    {result.companyName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className="bg-green-600 hover:bg-green-700 text-white border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Declared
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                    {result.declaredAt 
                      ? format(new Date(result.declaredAt), "MMM dd, yyyy")
                      : "Recent"
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link href={`/results/${result.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 group transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                      <ChevronRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}