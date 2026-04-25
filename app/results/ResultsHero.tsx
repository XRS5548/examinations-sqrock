// components/results/ResultsHero.tsx
"use client";

interface Stats {
  totalDeclared: number;
  evaluatedStudents: number;
  activeExams: number;
}

interface ResultsHeroProps {
  stats: Stats;
}

export function ResultsHero({ stats }: ResultsHeroProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-red-600 text-white rounded-full text-sm font-semibold mb-4">
            Results Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Check Exam Results Instantly
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Search your score, rank and status. Fast, secure and reliable.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.totalDeclared}+</div>
            <div className="text-sm text-gray-300 mt-1">Results Declared</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.evaluatedStudents.toLocaleString()}+</div>
            <div className="text-sm text-gray-300 mt-1">Students Evaluated</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.activeExams}+</div>
            <div className="text-sm text-gray-300 mt-1">Active Exams</div>
          </div>
        </div>
      </div>
    </div>
  );
}