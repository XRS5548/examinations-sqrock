// app/privacy/page.tsx
import { Navbar } from "@/websiteComponents/home/Navbar";
import { Footer } from "@/websiteComponents/home/Footer";
import { Shield, Lock, Eye, Database, FileText, Mail } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: "We collect information that you voluntarily provide to us when creating an account, registering for exams, subscribing to our newsletter, or contacting our support team. This includes your name, email address, roll number, and exam-related data. We also automatically collect technical data such as IP address, browser type, device information, and usage patterns to improve our services."
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: "Your information is used to provide, maintain, and improve our exam platform services. This includes processing exam registrations, verifying identity, calculating results, communicating important updates, and ensuring exam integrity through our anti-cheat systems. We never sell your personal data to third parties."
    },
    {
      icon: Shield,
      title: "Data Security",
      content: "We implement industry-standard security measures including encryption, secure servers, regular security audits, and access controls to protect your data from unauthorized access, alteration, disclosure, or destruction. All exam data is encrypted both in transit and at rest."
    },
    {
      icon: FileText,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information at any time. You can also request a copy of your data, withdraw consent for processing, and lodge a complaint with supervisory authorities. Contact our privacy team for any data-related requests."
    },
    {
      icon: Lock,
      title: "Cookies & Tracking",
      content: "We use essential cookies to ensure the proper functioning of our exam platform, including session management, security features, and maintaining exam integrity. These cookies are necessary for the platform to work correctly and cannot be disabled."
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: "If you have any questions about this Privacy Policy or how we handle your data, please contact our Data Protection Officer at privacy@examinermax.com or call our support team at +91 123 456 7890."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-red-600 mb-6">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Your trust matters to us. Learn how we protect your data.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Last updated: January 2026
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
            <p className="text-blue-800 text-center mb-0">
              🔒 At ExaminerMax, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.
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
            <h3 className="font-semibold text-gray-900 mb-3">Updates to This Policy</h3>
            <p className="text-sm text-gray-600 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. 
              We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">Version 2.0</span>
              <span className="text-xs text-gray-500">Effective: January 1, 2026</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}