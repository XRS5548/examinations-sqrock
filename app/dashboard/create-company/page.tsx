// app/dashboard/create-company/page.tsx
import { Suspense } from "react";
import { CreateCompanyForm } from "@/pagecomponents/CreateCompany/CreateCompanyForm"; 
import { Building2 } from "lucide-react";

export default async function CreateCompanyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-2xl mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Create Your Company
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Set up your organization to start creating exams
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-slate-500">Loading...</div>
          </div>
        }>
          <CreateCompanyForm />
        </Suspense>
      </div>
    </div>
  );
}