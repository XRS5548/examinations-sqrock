// app/terms/page.tsx
import { Navbar } from "@/websiteComponents/home/Navbar";
import { Footer } from "@/websiteComponents/home/Footer";
import { FileText, Users, Shield, AlertTriangle, Scale, Clock } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: "By accessing or using ExaminerMax, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our platform. These terms apply to all visitors, users, and others who access the service."
    },
    {
      icon: Users,
      title: "User Accounts",
      content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account."
    },
    {
      icon: Shield,
      title: "Use of Platform",
      content: "ExaminerMax provides an online examination platform for organizations and students. You agree to use the platform only for its intended purpose and in compliance with all applicable laws. You may not reproduce, duplicate, copy, sell, or exploit any portion of the service without express written permission."
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Activities",
      content: "You agree not to: engage in cheating, plagiarism, or academic dishonesty; attempt to bypass security measures; use automated scripts or bots; share exam content with unauthorized parties; impersonate another person; interfere with the proper working of the service; or attempt to gain unauthorized access to any part of the platform."
    },
    {
      icon: Scale,
      title: "Intellectual Property",
      content: "The content, features, and functionality of ExaminerMax are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not modify, reverse engineer, or create derivative works based on our platform without explicit permission."
    },
    {
      icon: Clock,
      title: "Termination",
      content: "We reserve the right to terminate or suspend your account immediately, without prior notice, for conduct that violates these terms or is harmful to other users. Upon termination, your right to use the service will cease immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-red-600 mb-6">
              <Scale className="h-8 w-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-600">
              Please read these terms carefully before using ExaminerMax.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Last updated: January 2026
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-12">
          <p className="text-yellow-800 text-center mb-0">
            ⚖️ By using ExaminerMax, you agree to these terms. Please read them carefully.
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="border-b border-gray-100 pb-8 last:border-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-50 rounded-xl">
                    <Icon className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 m-0">
                    {section.title}
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Governing Law</h3>
          <p className="text-sm text-gray-600 mb-4">
            These terms shall be governed by and construed in accordance with the laws of India, 
            without regard to its conflict of law provisions. Any disputes arising under these terms 
            shall be subject to the exclusive jurisdiction of the courts in Mumbai, India.
          </p>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-xs text-gray-500">Version 2.0</span>
            <span className="text-xs text-gray-500">Effective: January 1, 2026</span>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            For questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@examinermax.com" className="text-red-600 hover:text-red-700">
              sqrock.business@outlook.com
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}