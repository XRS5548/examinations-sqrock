// app/(auth)/login/page.tsx
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4">
            <span className="text-white font-bold text-xl">EM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Sign in to your account to continue
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}