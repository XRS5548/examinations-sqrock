// components/about/TimelineSection.tsx
"use client";

const timeline = [
  {
    year: "2024",
    title: "The Vision",
    description: "ExaminerMax founded with a mission to revolutionize online examinations",
  },
  {
    year: "2025",
    title: "Platform Launch",
    description: "Beta launch with 50+ companies and 10,000+ students",
  },
  {
    year: "2026",
    title: "Global Expansion",
    description: "Expanding to international markets with advanced features",
  },
  {
    year: "2027+",
    title: "Future Ready",
    description: "AI-powered proctoring and blockchain-based certification",
  },
];

export function TimelineSection() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-4">
            Our Journey
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Building the Future of Exams
          </h2>
        </div>
        
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200 hidden lg:block" />
          
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div key={index} className={`relative flex flex-col lg:flex-row ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8`}>
                <div className="flex-1 lg:text-right">
                  <div className="lg:pr-8">
                    <h3 className="text-2xl font-bold text-red-600 mb-2">{item.year}</h3>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-lg" />
                </div>
                
                <div className="flex-1 lg:text-left">
                  <div className="lg:pl-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}