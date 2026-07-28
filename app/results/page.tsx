// app/results/page.tsx
import { Suspense } from "react";
import { getLatestDeclaredResults, getResultStats, getSidebarData } from "@/actions/results-public";
import { Navbar } from "@/websiteComponents/home/Navbar";
import { Footer } from "@/websiteComponents/home/Footer"; 
import { ResultsHero } from "./ResultsHero"; 
import { ResultSearchForm } from "./ResultSearchForm"; 
import { LatestDeclaredResults } from "./LatestDeclaredResults";
import { ResultsTable } from "./ResultsTable";
import { ResultsSidebar } from "./ResultsSidebar"; 
import { Loader2 } from "lucide-react";

// Loading component for Suspense fallback
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-red-600 dark:text-red-400" />
    <p className="mt-3 text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

export default async function ResultsPage() {
  const [latestResultsRaw, stats, sidebarData] = await Promise.all([
    getLatestDeclaredResults(),
    getResultStats(),
    getSidebarData()
  ]);

  // Transform results to match expected types
  const latestResults = latestResultsRaw.map(result => ({
    id: result.id,
    examName: result.examName || "Unknown Exam",
    companyName: result.companyName || "Unknown Company",
    resultAnnounced: result.resultAnnounced ?? false,
    declaredAt: result.declaredAt,
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      
      <main>
        <ResultsHero stats={stats} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 order-1">
              <ResultSearchForm />
              
              <div className="mt-12 sm:mt-16">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 border-l-4 border-red-600 dark:border-red-500 pl-4">
                  Recently Declared Results
                </h2>
                <Suspense fallback={<LoadingFallback message="Loading results..." />}>
                  <ResultsTable results={latestResults} />
                </Suspense>
              </div>
            </div>
            
            {/* Sidebar - Right Side */}
            <div className="lg:col-span-1 order-2 lg:order-2">
              <Suspense fallback={<LoadingFallback message="Loading sidebar..." />}>
                <ResultsSidebar {...sidebarData} />
              </Suspense>
            </div>
          </div>
        </div>
        
        {/* Latest Results Section */}
        <div className="bg-gray-50 dark:bg-gray-900/50 py-12 sm:py-16 mt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
              Latest Results Declared
            </h2>
            <Suspense fallback={<LoadingFallback message="Loading latest results..." />}>
              <LatestDeclaredResults results={latestResults.slice(0, 3)} />
            </Suspense>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}