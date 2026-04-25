// components/about/AboutHero.tsx
"use client";

import Image from "next/image";

export function AboutHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-1 bg-red-600/20 border border-red-500/30 rounded-full text-sm font-semibold text-red-400 mb-6">
              Trusted by 1000+ organizations
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Reinventing Online
              <span className="text-red-500"> Examinations</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              ExaminerMax helps organizations conduct secure, scalable and intelligent examinations.
            </p>
            <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition shadow-lg">
              Explore Platform →
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl blur-3xl opacity-20" />
            <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-700 rounded w-5/6" />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="h-20 bg-gray-700 rounded" />
                    <div className="h-20 bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}