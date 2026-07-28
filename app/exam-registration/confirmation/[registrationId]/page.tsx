"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation"; // 👈 ADD useRouter
import { format, subDays } from "date-fns";
import { 
  Printer, 
  Calendar, 
  Building2, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Hash, 
  CheckCircle, 
  Loader2,
  FileText,
  Download,
  ExternalLink,
  ArrowRight, // 👈 ADD THIS
  PlayCircle // 👈 ADD THIS
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/websiteComponents/home/Navbar";
import { Footer } from "@/websiteComponents/home/Footer";
import { getRegistrationDetails, type RegistrationDetails } from "@/actions/public-registration";

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter(); // 👈 ADD THIS
  const printRef = useRef<HTMLDivElement>(null);
  const [details, setDetails] = useState<RegistrationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const registrationId = Number(params.registrationId);
    if (registrationId) {
      getRegistrationDetails(registrationId).then((data) => {
        setDetails(data);
        setLoading(false);
      });
    }
  }, [params.registrationId]);

  const handlePrint = () => {
    window.print();
  };

  // 👈 ADD THIS FUNCTION
  const handleAttendExam = () => {
    if (details) {
      const email = encodeURIComponent(details.studentEmail!);
      const rollno = encodeURIComponent(details.rollNumber!);
      router.push(`/join?email=${email}&rollno=${rollno}`);
    }
  };

  // Helper function to get display date (one day before actual date)
  const getDisplayDate = (date: Date | null): Date | null => {
    if (!date) return null;
    try {
      return subDays(new Date(date), 1);
    } catch (error) {
      return null;
    }
  };

  // Format date for display (shows one day before)
  const formatExamDate = (date: Date | null) => {
    if (!date) return "TBA";
    try {
      const displayDate = getDisplayDate(date);
      if (!displayDate) return "TBA";
      return format(displayDate, "PPP");
    } catch (error) {
      return "TBA";
    }
  };

  // Get actual date for reference
  const getActualDate = (date: Date | null) => {
    if (!date) return null;
    try {
      return format(new Date(date), "PPP");
    } catch (error) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Registration details not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Format DOB if available
  const formattedDob = details.studentDob 
    ? format(new Date(details.studentDob), "PPP")
    : "N/A";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      {/* Action Buttons - hidden when printing */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 print:hidden">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* 👈 ATTEND EXAM BUTTON - HIGHLIGHTED */}
          <Button 
            onClick={handleAttendExam} 
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg shadow-lg shadow-green-500/30 hover:shadow-green-600/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-0"
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            Attend Exam Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          
          <Button 
            onClick={handlePrint} 
            variant="outline" 
            className="flex-1 sm:flex-none sm:w-auto"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* 👈 ADD A PROMINENT BANNER ABOVE THE CONFIRMATION CARD */}
        <div className="mt-4 print:hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-2 animate-pulse">
                <PlayCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Ready to start your exam?
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click the button below to begin
                </p>
              </div>
            </div>
            <Button 
              onClick={handleAttendExam}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-5 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-600/40 transition-all duration-300 transform hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Start Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>

        <div ref={printRef} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mt-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white text-center print:bg-red-600">
            <CheckCircle className="h-12 w-12 mx-auto mb-2" />
            <h1 className="text-2xl font-bold">Registration Confirmed</h1>
            <p className="text-red-100 mt-1">Your exam registration has been completed successfully</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Roll Number */}
            <div className="text-center border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-sm text-gray-500 mb-1">Your Roll Number</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-wider">
                {details.rollNumber}
              </p>
            </div>

            {/* Student Details */}
            <Card>
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <User className="h-4 w-4 text-blue-500" />
                  Student Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500 w-24">Name</span>
                  <span className="text-gray-900 dark:text-white font-medium">{details.studentName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500 w-24">Email</span>
                  <span className="text-gray-900 dark:text-white">{details.studentEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500 w-24">Phone</span>
                  <span className="text-gray-900 dark:text-white">{details.studentPhone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500 w-24">Date of Birth</span>
                  <span className="text-gray-900 dark:text-white">{formattedDob}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Hash className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500 w-24">Roll Number</span>
                  <span className="text-gray-900 dark:text-white font-mono">{details.rollNumber}</span>
                </div>
                {details.status && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-gray-500 w-24">Status</span>
                    <span className="text-green-600 dark:text-green-400 font-medium capitalize">
                      {details.status.replace('_', ' ')}
                    </span>
                  </div>
                )}
                {details.createdAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-500 w-24">Registered On</span>
                    <span className="text-gray-900 dark:text-white">
                      {format(new Date(details.createdAt), "PPP 'at' h:mm a")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exam Details */}
            <Card>
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  Exam Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500 w-24">Exam Name</span>
                  <span className="text-gray-900 dark:text-white font-medium">{details.examName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500 w-24">Organization</span>
                  <span className="text-gray-900 dark:text-white">{details.companyName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500 w-24">Exam Date</span>
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatExamDate(details.examDate)}
                    </span>
                    {details.examDate && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Closed: {getActualDate(details.examDate)}
                      </p>
                    )}
                  </div>
                </div>
                {details.durationMinutes && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-500 w-24">Duration</span>
                    <span className="text-gray-900 dark:text-white">{details.durationMinutes} minutes</span>
                  </div>
                )}
                {details.totalMarks && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-gray-500 w-24">Total Marks</span>
                    <span className="text-gray-900 dark:text-white">{details.totalMarks}</span>
                  </div>
                )}
                {/* Syllabus PDF */}
                {details.syllabusPdf && (
                  <div className="flex items-center gap-3 text-sm p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="text-gray-500 w-24">Syllabus</span>
                    <a 
                      href={details.syllabusPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download PDF
                      <ExternalLink className="h-3 w-3 ml-0.5" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exam Instructions */}
            <Card className="border-2 border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader className="border-b border-amber-200 dark:border-amber-800/50">
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <FileText className="h-4 w-4" />
                  Important Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>Please arrive at least 30 minutes before the exam start time.</li>
                  <li>Bring a valid photo ID and this registration confirmation.</li>
                  <li>Electronic devices are not allowed inside the exam hall.</li>
                  <li>Download and review the syllabus PDF for exam preparation.</li>
                  <li>For any queries, contact the exam coordinator.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Footer Note */}
            <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700 print:pt-4">
              <p>This is a computer-generated registration confirmation.</p>
              <p className="mt-1">Please keep this document for future reference.</p>
              <p className="mt-1">Registration ID: #{details.id}</p>
            </div>
          </div>
        </div>

        {/* 👈 BOTTOM ACTION BUTTON - STICKY ON MOBILE */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 print:hidden lg:hidden">
          <Button 
            onClick={handleAttendExam} 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg shadow-lg shadow-green-500/30"
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            Attend Exam Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {/* Add padding at bottom for mobile to prevent button overlap */}
        <div className="h-24 lg:h-0 print:hidden"></div>
      </main>
      <Footer />
    </div>
  );
}