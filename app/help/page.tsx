// app/help/page.tsx
import { Navbar } from "@/websiteComponents/home/Navbar";
import { Footer } from "@/websiteComponents/home/Footer";

export default function HelpPage() {
  const faqs = [
    { q: "How do I take an exam?", a: "Enter your roll number and email on the results page to access your exam." },
    { q: "What if I face technical issues?", a: "Contact our support team immediately at sqrock.business@outlook.com" },
    { q: "How are results calculated?", a: "MCQs are auto-graded, subjective answers are manually evaluated by instructors." },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600">Find answers to common questions</p>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}