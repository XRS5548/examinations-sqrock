// components/home/Navbar.tsx
"use client";

import { useState } from "react";
import { Menu, X, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Exams", href: "/#exams" },
  { name: "Articles", href: "/articles" },
  { name: "Results", href: "/results" },
  { name: "About", href: "/about" },
];

// Separate registration item with icon
const registrationItem = { 
  name: "Register", 
  href: "/exam-registration",
  icon: FileText
};

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for home
    if (href === "/") {
      return pathname === href;
    }
    // For hash links, check if we're on the home page
    if (href.startsWith("/#")) {
      return pathname === "/";
    }
    // For other routes, check exact match or if it's the registration page
    if (href === "/exam-registration") {
      return pathname === href || pathname.startsWith("/exam-registration/");
    }
    // For other routes, exact match
    return pathname === href;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link href="/">
              <img src="/logo.png" alt="ExaminerMax Logo" className="h-10" />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Registration Link with Icon */}
            <Link
              href={registrationItem.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(registrationItem.href)
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg"
              }`}
            >
              <FileText className="h-4 w-4" />
              {registrationItem.name}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${
                    isActive(item.href) 
                      ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20" 
                      : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Registration Link */}
              <Link
                href={registrationItem.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                  isActive(registrationItem.href)
                    ? "bg-red-600 text-white"
                    : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                {registrationItem.name}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}