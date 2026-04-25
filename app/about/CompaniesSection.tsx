// components/about/CompaniesSection.tsx
"use client";

import Link from "next/link";

interface Company {
  id: number;
  name: string | null;
  industry: string | null;
  logoUrl: string | null;
}

interface CompaniesSectionProps {
  companies: Company[];
}

export function CompaniesSection({ companies }: CompaniesSectionProps) {
  const displayCompanies = companies.slice(0, 8);

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-4">
            Trusted Worldwide
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
             Companies Trust ExaminerMax
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From educational institutions to corporate training departments
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition border border-gray-100"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-gray-600">
                  {company.name?.charAt(0) || "C"}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">{company.name}</h3>
              <p className="text-sm text-gray-500">{company.industry || "Education"}</p>
            </div>
          ))}
        </div>
        
        {companies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Join hundreds of companies already using ExaminerMax</p>
          </div>
        )}
      </div>
    </div>
  );
}