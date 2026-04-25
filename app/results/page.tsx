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
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <ResultsHero stats={stats} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <ResultSearchForm />
              
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-red-600 pl-4">
                  Recently Declared Results
                </h2>
                <Suspense fallback={<div className="text-center py-12">Loading results...</div>}>
                  <ResultsTable results={latestResults} />
                </Suspense>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <Suspense fallback={<div className="text-center py-12">Loading sidebar...</div>}>
                <ResultsSidebar {...sidebarData} />
              </Suspense>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 py-16 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Latest Results Declared
            </h2>
            <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
              <LatestDeclaredResults results={latestResults.slice(0, 3)} />
            </Suspense>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}