// components/home/CompaniesGrid.tsx
"use client";

import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Company = {
  id: number;
  name: string | null;
  industry: string | null;
  logoUrl: string | null;
};

interface CompaniesGridProps {
  companies: Company[];
}

export function CompaniesGrid({ companies }: CompaniesGridProps) {
  return (
    <section id="companies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registered Companies</h2>
        <a href="#" className="text-sm text-red-600 hover:text-red-700">View all →</a>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {companies.length > 0 ? (
          companies.slice(0, 8).map((company) => (
            <div key={company.id} className="group p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-all hover:border-red-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold">
                  {company.name?.charAt(0) || "C"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{company.name}</h3>
                  <p className="text-xs text-gray-500">{company.industry || "Education"}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">No companies registered yet</div>
        )}
      </div>
    </section>
  );
}