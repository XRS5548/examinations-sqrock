// app/join/page.tsx
import { Suspense } from "react";
import { JoinForm } from "./JoinForm"; 

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <JoinForm />
      </Suspense>
    </div>
  );
}