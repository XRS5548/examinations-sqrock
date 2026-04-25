// app/careers/page.tsx
'use client'
import { Navbar } from "@/websiteComponents/home/Navbar";
import { Footer } from "@/websiteComponents/home/Footer";
import { Briefcase, MapPin, Clock, Mail, Users, Rocket, Award, Heart } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
  const positions = [
    { 
      title: "Senior Full Stack Developer", 
      location: "Remote", 
      type: "Full-time",
      experience: "5+ years",
      description: "Build scalable exam platforms using Next.js, Node.js, and PostgreSQL."
    },
    { 
      title: "Product Manager", 
      location: "Mumbai", 
      type: "Full-time",
      experience: "3+ years",
      description: "Lead product strategy and roadmap for our exam platform."
    },
    { 
      title: "Sales Executive", 
      location: "Remote", 
      type: "Full-time",
      experience: "2+ years",
      description: "Drive growth by connecting with educational institutions."
    },
    { 
      title: "UI/UX Designer", 
      location: "Remote", 
      type: "Full-time",
      experience: "3+ years",
      description: "Create beautiful and intuitive user experiences."
    },
    { 
      title: "Quality Assurance Engineer", 
      location: "Remote", 
      type: "Full-time",
      experience: "2+ years",
      description: "Ensure platform reliability and exam integrity."
    },
    { 
      title: "DevOps Engineer", 
      location: "Remote", 
      type: "Full-time",
      experience: "4+ years",
      description: "Manage cloud infrastructure and deployment pipelines."
    },
  ];

  const benefits = [
    { icon: Rocket, title: "Fast-paced Environment", desc: "Work with cutting-edge technology" },
    { icon: Award, title: "Learning Budget", desc: "Annual budget for courses & conferences" },
    { icon: Heart, title: "Health Insurance", desc: "Comprehensive coverage for you" },
    { icon: Users, title: "Great Team", desc: "Work with talented professionals" },
  ];

  const handleApply = (jobTitle: string) => {
    const subject = encodeURIComponent(`Application for ${jobTitle} position`);
    const body = encodeURIComponent(
      "Dear Hiring Team,\n\n" +
      "I am writing to apply for the " + jobTitle + " position at ExaminerMax.\n\n" +
      "Please find my resume attached.\n\n" +
      "Thank you for your consideration.\n\n" +
      "Best regards,\n" +
      "[Your Name]"
    );
    window.location.href = `mailto:sqrock.business@outlook.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 mb-6">
              <Briefcase className="h-8 w-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Join Our Team</h1>
            <p className="text-xl text-gray-300">
              Help us revolutionize online examinations and shape the future of education.
            </p>
          </div>
        </div>
      </div>

      {/* Why Join Us */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join ExaminerMax?</h2>
          <p className="text-lg text-gray-600">We offer a workplace where you can grow and make an impact</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-500">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-lg text-gray-600">Join a team of passionate individuals</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {positions.map((job, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {job.experience}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{job.description}</p>
                <button 
                  onClick={() => handleApply(job.title)}
                  className="text-red-600 font-semibold hover:text-red-700 transition inline-flex items-center gap-1"
                >
                  Apply Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How to Apply */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-8 text-white text-center">
          <Mail className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">How to Apply</h2>
          <p className="text-red-100 mb-4">
            Send your resume and cover letter to our HR team
          </p>
          <a 
            href="mailto:sqrock.business@outlook.com?subject=Job%20Application&body=Dear%20Hiring%20Team%2C%0A%0AI%20am%20writing%20to%20apply%20for%20the%20position%20at%20ExaminerMax.%0A%0APlease%20find%20my%20resume%20attached.%0A%0AThank%20you%20for%20your%20consideration.%0A%0ABest%20regards%2C%0A%5BYour%20Name%5D"
            className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            <Mail className="h-4 w-4" />
            Apply via Email
          </a>
          <p className="text-sm text-red-100 mt-4">
            Or send your application to: <strong>sqrock.business@outlook.com</strong>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}