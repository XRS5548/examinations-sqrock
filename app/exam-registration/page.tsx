"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, subDays } from "date-fns";
import {
  Calendar,
  Building2,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Award,
  Users,
  ArrowRight,
  FileText,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Sparkles,
  Shield,
  ChevronRight,
  Eye,        // NEW
  X,          // NEW
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/websiteComponents/home/Navbar";
import { Footer } from "@/websiteComponents/home/Footer";
import { getAvailableExams, registerForExam, type PublicExam } from "@/actions/public-registration";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExamRegistrationPage() {
  const router = useRouter();
  const domains = [
    "Web Development",
    "Data Science",
    "Python",
    
    "Java",
    "Android Development",
    "Frontend Development",
    "Backend Development",
    "UI/UX Design",
  ];
  const [exams, setExams] = useState<PublicExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    domain: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [infoExam, setInfoExam] = useState<PublicExam | null>(null);

  useEffect(() => {
    getAvailableExams().then((data) => {
      setExams(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) {
      setError("Please select an exam");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");

    const fd = new FormData();
    fd.set("name", formData.name);
    fd.set("email", formData.email);
    fd.set("phone", formData.phone);
    fd.set("dob", formData.dob);
    fd.set("domain", formData.domain);
    fd.set("examId", String(selectedExamId));

    const result = await registerForExam(fd);

    if (result.success) {
      router.push(`/exam-registration/confirmation/${result.registrationId}`);
    } else {
      setError(result.error || "Registration failed");
      setSubmitting(false);
    }
  };

  const selectedExam = exams.find((e) => e.id === selectedExamId);

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
      return format(displayDate, "MMM dd, yyyy");
    } catch (error) {
      return "TBA";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />

      {/* Decorative elements */}
      <div className="fixed top-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants as Variants} className="text-center">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Public Registration
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
              Exam Registration
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Select your exam and complete registration to begin your assessment journey
            </p>
          </motion.div>

          {/* Stats Section */}
          {!loading && exams.length > 0 && (
            <motion.div variants={itemVariants as Variants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-0 shadow-lg">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available Exams</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{exams.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-0 shadow-lg">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Companies</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Set(exams.map(e => e.companyName)).size}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-0 shadow-lg">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Secure Registration</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">✓</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div variants={itemVariants as Variants}>
            <Card className="border-0 shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-8">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                      <p className="mt-4 text-gray-500 dark:text-gray-400">Loading available exams...</p>
                    </div>
                  ) : exams.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Exams Available</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        There are currently no public exams open for registration.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Exam Selection */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                            Select Your Exam
                          </Label>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {exams.length} available
                          </span>
                        </div>

                        <div className="grid gap-3">
                          {exams.map((exam) => (
                            <motion.div
                              key={exam.id}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <Card
                                className={`cursor-pointer transition-all duration-300 ${selectedExamId === exam.id
                                  ? "ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20"
                                  : "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                                  }`}
                                onClick={() => {
                                  setSelectedExamId(exam.id);
                                  setError("");
                                }}
                              >
                                <CardContent className="flex items-center justify-between p-4">
                                  <div className="flex-1 min-w-0">

                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                                        {exam.name}
                                      </p>
                                      {selectedExamId === exam.id && (
                                        <Badge className="bg-blue-500 text-white border-0">
                                          Selected
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                      <span className="flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5 text-blue-500" />
                                        {exam.companyName}
                                      </span>
                                      <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-purple-500" />
                                        {formatExamDate(exam.examDate)}
                                      </span>
                                      {exam.durationMinutes && (
                                        <span className="flex items-center gap-1.5">
                                          <Clock className="h-3.5 w-3.5 text-green-500" />
                                          {exam.durationMinutes} min
                                        </span>
                                      )}
                                      {exam.totalMarks && (
                                        <span className="flex items-center gap-1.5">
                                          <Award className="h-3.5 w-3.5 text-orange-500" />
                                          {exam.totalMarks} marks
                                        </span>
                                      )}
                                    </div>
                                    {/* Show actual date in smaller text */}
                                    {exam.examDate && (
                                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Closed: {format(new Date(exam.examDate), "MMM dd, yyyy")}
                                      </p>
                                    )}


                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mr-3 flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInfoExam(exam);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1.5" />
                                    View Details
                                  </Button>
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedExamId === exam.id
                                    ? "border-blue-500 bg-blue-500 shadow-lg shadow-blue-500/30"
                                    : "border-gray-300 dark:border-gray-600"
                                    }`}>
                                    {selectedExamId === exam.id && (
                                      <CheckCircle className="h-5 w-5 text-white" />
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Registration Form */}
                      <AnimatePresence>
                        {selectedExam && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-200 dark:border-gray-700 pt-8"
                          >
                            <div className="flex items-center gap-2 mb-6">
                              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Your Details
                              </h2>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedExam.name}
                              </span>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                              <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                  <Label htmlFor="name" className="text-sm font-medium">
                                    <User className="h-3.5 w-3.5 inline mr-1.5 text-blue-500" />
                                    Full Name
                                  </Label>
                                  <Input
                                    id="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    onFocus={() => setFocusedField("name")}
                                    onBlur={() => setFocusedField(null)}
                                    className={`transition-all ${focusedField === "name" ? "ring-2 ring-blue-500/20 border-blue-500" : ""
                                      }`}
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="email" className="text-sm font-medium">
                                    <Mail className="h-3.5 w-3.5 inline mr-1.5 text-purple-500" />
                                    Email
                                  </Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    onFocus={() => setFocusedField("email")}
                                    onBlur={() => setFocusedField(null)}
                                    className={`transition-all ${focusedField === "email" ? "ring-2 ring-purple-500/20 border-purple-500" : ""
                                      }`}
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="phone" className="text-sm font-medium">
                                    <Phone className="h-3.5 w-3.5 inline mr-1.5 text-green-500" />
                                    Phone Number
                                  </Label>
                                  <Input
                                    id="phone"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    onFocus={() => setFocusedField("phone")}
                                    onBlur={() => setFocusedField(null)}
                                    className={`transition-all ${focusedField === "phone" ? "ring-2 ring-green-500/20 border-green-500" : ""
                                      }`}
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor="dob" className="text-sm font-medium">
                                    <CalendarIcon className="h-3.5 w-3.5 inline mr-1.5 text-orange-500" />
                                    Date of Birth
                                  </Label>
                                  <Input
                                    id="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    onFocus={() => setFocusedField("dob")}
                                    onBlur={() => setFocusedField(null)}
                                    className={`transition-all ${focusedField === "dob" ? "ring-2 ring-orange-500/20 border-orange-500" : ""
                                      }`}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5 relative">
                                <Label htmlFor="domain" className="text-sm font-medium">
                                  Domain Name
                                </Label>

                                <Select
                                  value={formData.domain}
                                  onValueChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      domain: value,
                                    })
                                  }
                                  required
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select your domain" />
                                  </SelectTrigger>

                                  <SelectContent>
                                    {domains.map((domain) => (
                                      <SelectItem key={domain} value={domain}>
                                        {domain}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {/* Search Suggestions */}
                                {focusedField === "domain" && formData.domain.length > 0 && (
                                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                                    {domains
                                      .filter((domain) =>
                                        domain.toLowerCase().includes(formData.domain.toLowerCase())
                                      )
                                      .map((domain) => (
                                        <button
                                          key={domain}
                                          type="button"
                                          className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                                          onMouseDown={(e) => {
                                            e.preventDefault();

                                            setFormData({
                                              ...formData,
                                              domain,
                                            });

                                            setFocusedField(null);
                                          }}
                                        >
                                          {domain}
                                        </button>
                                      ))}

                                    {domains.filter((domain) =>
                                      domain.toLowerCase().includes(formData.domain.toLowerCase())
                                    ).length === 0 && (
                                        <div className="px-4 py-3 text-sm text-gray-500">
                                          No domain found
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>


                              {error && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-start gap-2.5 text-red-600 text-sm bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-800"
                                >
                                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                  <span>{error}</span>
                                </motion.div>
                              )}

                              <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 rounded-xl group"
                                disabled={submitting}
                              >
                                {submitting ? (
                                  <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Processing Registration...
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                                    Register for Exam
                                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </Button>

                              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                By registering, you agree to our terms and conditions. Your information is secure and will only be used for exam purposes.
                              </p>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      {infoExam && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setInfoExam(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-6 py-5">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Exam Information
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {infoExam.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setInfoExam(null)}
                className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">

              {/* Company */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                <div className="p-2.5 rounded-lg bg-blue-500/10">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Conducted By
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {infoExam.companyName || "N/A"}
                  </p>
                </div>
              </div>

              {/* Exam Description */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  About This Exam
                </h3>

                <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {infoExam.description || "No description available for this exam."}
                </p>
              </div>

              {/* Exam Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Date */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Exam Date
                    </span>
                  </div>

                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatExamDate(infoExam.examDate)}
                  </p>
                </div>

                {/* Duration */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Duration
                    </span>
                  </div>

                  <p className="font-semibold text-gray-900 dark:text-white">
                    {infoExam.durationMinutes
                      ? `${infoExam.durationMinutes} Minutes`
                      : "Not specified"}
                  </p>
                </div>

                {/* Marks */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Total Marks
                    </span>
                  </div>

                  <p className="font-semibold text-gray-900 dark:text-white">
                    {infoExam.totalMarks ?? "Not specified"}
                  </p>
                </div>

                {/* Status */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Registration
                    </span>
                  </div>

                  <p className="font-semibold text-green-600 dark:text-green-400">
                    Open
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-6"
                  onClick={() => {
                    setSelectedExamId(infoExam.id);
                    setInfoExam(null);
                    setError("");
                  }}
                >
                  Select This Exam
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
      <Footer />
    </div>
  );
}