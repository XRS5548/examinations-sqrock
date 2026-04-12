// components/home/Footer.tsx
import {  Mail } from "lucide-react";
import { Mali } from "next/font/google";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">EM</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">ExaminerMax</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              India's leading exam management platform.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-red-600 transition">About Us</a></li>
              <li><a href="#" className="hover:text-red-600 transition">Contact</a></li>
              <li><a href="#" className="hover:text-red-600 transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-red-600 transition">Blog</a></li>
              <li><a href="#" className="hover:text-red-600 transition">Help Center</a></li>
              <li><a href="#" className="hover:text-red-600 transition">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="text-gray-600 hover:text-red-600 transition">
              </a>
              <a href="#" className="text-gray-600 hover:text-red-600 transition">
              </a>
              <a href="#" className="text-gray-600 hover:text-red-600 transition">
              </a>
              <a href="#" className="text-gray-600 hover:text-red-600 transition">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © 2026 ExaminerMax. All rights reserved.
        </div>
      </div>
    </footer>
  );
}