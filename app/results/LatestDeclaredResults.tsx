// app/results/LatestDeclaredResults.tsx
"use client";

import { format } from "date-fns";
import { Calendar, Building2, Award, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <Card className="border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-10 w-10 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Results Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Results will appear here once declared</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {results.map((result) => (
        <Card 
          key={result.id} 
          className="border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative"
        >
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-400 dark:from-red-500 dark:to-red-600" />
          
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                  {result.examName}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{result.companyName}</span>
                </div>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 shrink-0 ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                New
              </Badge>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              Declared: {result.declaredAt 
                ? format(new Date(result.declaredAt), "MMM dd, yyyy")
                : "Recently"
              }
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}