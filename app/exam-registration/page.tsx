// app/exam-registration/page.tsx

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
  ArrowRight,
  FileText,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Sparkles,
  Shield,
  ChevronRight,
  Eye,
  X,
  GraduationCap,
  MapPin,
  Home,
  UserCircle,
  BookOpen,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/websiteComponents/home/Navbar";
import { Footer } from "@/websiteComponents/home/Footer";
import { getAvailableExams, registerForExam, type PublicExam } from "@/actions/public-registration";
import { INTERNSHIP_DOMAINS } from "@/lib/internship";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExamRegistrationPage() {
  const router = useRouter();
  
  const domains = INTERNSHIP_DOMAINS;

  const courses = [
    "B.Tech",
    "B.E.",
    "B.Sc",
    "B.Com",
    "BBA",
    "BCA",
    "M.Tech",
    "M.E.",
    "M.Sc",
    "M.Com",
    "MBA",
    "MCA",
    "Diploma",
    "Other",
  ];

  const branches = [
    "Computer Science",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Artificial Intelligence",
    "Data Science",
    "Cyber Security",
    "Other",
  ];

  const semesters = [
    "1st Semester",
    "2nd Semester",
    "3rd Semester",
    "4th Semester",
    "5th Semester",
    "6th Semester",
    "7th Semester",
    "8th Semester",
    "Graduated",
  ];

  const [exams, setExams] = useState<PublicExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  
  // =====================================================
  // EXPANDED FORM DATA - All fields for offer letter
  // =====================================================
  const [formData, setFormData] = useState({
    // Personal Details
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    
    // Education Details
    universityName: "",
    collegeName: "",
    course: "",
    branch: "",
    semester: "",
    enrollmentNumber: "",
    graduationYear: "",
    
    // Address Details
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    
    // Domain
    domain: "",
    
    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  const [error, setError] = useState("");
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

    const fd = new FormData();
    
    // Personal Details
    fd.set("name", formData.name);
    fd.set("email", formData.email);
    fd.set("phone", formData.phone);
    fd.set("dob", formData.dob);
    fd.set("gender", formData.gender);
    
    // Education Details
    fd.set("universityName", formData.universityName);
    fd.set("collegeName", formData.collegeName);
    fd.set("course", formData.course);
    fd.set("branch", formData.branch);
    fd.set("semester", formData.semester);
    fd.set("enrollmentNumber", formData.enrollmentNumber);
    fd.set("graduationYear", formData.graduationYear);
    
    // Address Details
    fd.set("address", formData.address);
    fd.set("city", formData.city);
    fd.set("state", formData.state);
    fd.set("country", formData.country);
    fd.set("pincode", formData.pincode);
    
    // Domain
    fd.set("domain", formData.domain);
    
    // Emergency Contact
    fd.set("emergencyContactName", formData.emergencyContactName);
    fd.set("emergencyContactPhone", formData.emergencyContactPhone);
    fd.set("emergencyContactRelation", formData.emergencyContactRelation);
    
    // Exam Selection
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

  const getDisplayDate = (date: Date | null): Date | null => {
    if (!date) return null;
    try {
      return subDays(new Date(date), 1);
    } catch {
      return null;
    }
  };

  const formatExamDate = (date: Date | null) => {
    if (!date) return "TBA";
    try {
      const displayDate = getDisplayDate(date);
      if (!displayDate) return "TBA";
      return format(displayDate, "MMM dd, yyyy");
    } catch {
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

                            <form onSubmit={handleSubmit} className="space-y-8">
                              
                              {/* ===================================================== */}
                              {/* PERSONAL DETAILS */}
                              {/* ===================================================== */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <UserCircle className="h-5 w-5 text-blue-500" />
                                  Personal Details
                                </h3>
                                
                                <div className="grid md:grid-cols-2 gap-5">
                                  <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                      <User className="h-3.5 w-3.5 inline mr-1.5 text-blue-500" />
                                      Full Name *
                                    </Label>
                                    <Input
                                      id="name"
                                      placeholder="Enter your full name"
                                      value={formData.name}
                                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                      onFocus={() => setFocusedField("name")}
                                      onBlur={() => setFocusedField(null)}
                                      className={`transition-all ${focusedField === "name" ? "ring-2 ring-blue-500/20 border-blue-500" : ""}`}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                      <Mail className="h-3.5 w-3.5 inline mr-1.5 text-purple-500" />
                                      Email *
                                    </Label>
                                    <Input
                                      id="email"
                                      type="email"
                                      placeholder="Enter your email"
                                      value={formData.email}
                                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                      onFocus={() => setFocusedField("email")}
                                      onBlur={() => setFocusedField(null)}
                                      className={`transition-all ${focusedField === "email" ? "ring-2 ring-purple-500/20 border-purple-500" : ""}`}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-sm font-medium">
                                      <Phone className="h-3.5 w-3.5 inline mr-1.5 text-green-500" />
                                      Phone Number *
                                    </Label>
                                    <Input
                                      id="phone"
                                      placeholder="Enter your phone number"
                                      value={formData.phone}
                                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                      onFocus={() => setFocusedField("phone")}
                                      onBlur={() => setFocusedField(null)}
                                      className={`transition-all ${focusedField === "phone" ? "ring-2 ring-green-500/20 border-green-500" : ""}`}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="dob" className="text-sm font-medium">
                                      <CalendarIcon className="h-3.5 w-3.5 inline mr-1.5 text-orange-500" />
                                      Date of Birth *
                                    </Label>
                                    <Input
                                      id="dob"
                                      type="date"
                                      value={formData.dob}
                                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                      onFocus={() => setFocusedField("dob")}
                                      onBlur={() => setFocusedField(null)}
                                      className={`transition-all ${focusedField === "dob" ? "ring-2 ring-orange-500/20 border-orange-500" : ""}`}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="gender" className="text-sm font-medium">
                                      Gender
                                    </Label>
                                    <Select
                                      value={formData.gender}
                                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>

                              {/* ===================================================== */}
                              {/* EDUCATION DETAILS */}
                              {/* ===================================================== */}
                              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <GraduationCap className="h-5 w-5 text-purple-500" />
                                  Education Details
                                </h3>
                                
                                <div className="grid md:grid-cols-2 gap-5">
                                  <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="universityName" className="text-sm font-medium">
                                      University Name *
                                    </Label>
                                    <Input
                                      id="universityName"
                                      placeholder="e.g., Rajasthan Technical University"
                                      value={formData.universityName}
                                      onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="collegeName" className="text-sm font-medium">
                                      College Name *
                                    </Label>
                                    <Input
                                      id="collegeName"
                                      placeholder="e.g., Government Engineering College"
                                      value={formData.collegeName}
                                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="course" className="text-sm font-medium">
                                      Course *
                                    </Label>
                                    <Select
                                      value={formData.course}
                                      onValueChange={(value) => setFormData({ ...formData, course: value })}
                                      required
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select course" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {courses.map((course) => (
                                          <SelectItem key={course} value={course}>
                                            {course}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="branch" className="text-sm font-medium">
                                      Branch *
                                    </Label>
                                    <Select
                                      value={formData.branch}
                                      onValueChange={(value) => setFormData({ ...formData, branch: value })}
                                      required
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {branches.map((branch) => (
                                          <SelectItem key={branch} value={branch}>
                                            {branch}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="semester" className="text-sm font-medium">
                                      Current Semester *
                                    </Label>
                                    <Select
                                      value={formData.semester}
                                      onValueChange={(value) => setFormData({ ...formData, semester: value })}
                                      required
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select semester" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {semesters.map((sem) => (
                                          <SelectItem key={sem} value={sem}>
                                            {sem}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="enrollmentNumber" className="text-sm font-medium">
                                      <Hash className="h-3.5 w-3.5 inline mr-1.5 text-gray-500" />
                                      Enrollment Number *
                                    </Label>
                                    <Input
                                      id="enrollmentNumber"
                                      placeholder="e.g., 21CS1234"
                                      value={formData.enrollmentNumber}
                                      onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="graduationYear" className="text-sm font-medium">
                                      Expected Graduation Year *
                                    </Label>
                                    <Input
                                      id="graduationYear"
                                      type="number"
                                      placeholder="e.g., 2025"
                                      min="2020"
                                      max="2035"
                                      value={formData.graduationYear}
                                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* ===================================================== */}
                              {/* ADDRESS DETAILS */}
                              {/* ===================================================== */}
                              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <MapPin className="h-5 w-5 text-green-500" />
                                  Address Details
                                </h3>
                                
                                <div className="grid md:grid-cols-2 gap-5">
                                  <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="address" className="text-sm font-medium">
                                      <Home className="h-3.5 w-3.5 inline mr-1.5 text-green-500" />
                                      Full Address *
                                    </Label>
                                    <Textarea
                                      id="address"
                                      placeholder="House No., Street, Area"
                                      value={formData.address}
                                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                      rows={2}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="city" className="text-sm font-medium">
                                      City *
                                    </Label>
                                    <Input
                                      id="city"
                                      placeholder="e.g., Jaipur"
                                      value={formData.city}
                                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="state" className="text-sm font-medium">
                                      State *
                                    </Label>
                                    <Input
                                      id="state"
                                      placeholder="e.g., Rajasthan"
                                      value={formData.state}
                                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="country" className="text-sm font-medium">
                                      Country *
                                    </Label>
                                    <Input
                                      id="country"
                                      placeholder="e.g., India"
                                      value={formData.country}
                                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="pincode" className="text-sm font-medium">
                                      Pincode *
                                    </Label>
                                    <Input
                                      id="pincode"
                                      placeholder="e.g., 302001"
                                      value={formData.pincode}
                                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                      required
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <BookOpen className="h-5 w-5 text-orange-500" />
                                  Internship Domain
                                </h3>

                                <div className="space-y-1.5 max-w-md">
                                  <Label htmlFor="domain" className="text-sm font-medium">
                                    Domain *
                                  </Label>
                                  <Select
                                    value={formData.domain}
                                    onValueChange={(value) => setFormData({ ...formData, domain: value })}
                                    required
                                  >
                                    <SelectTrigger id="domain">
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
                                </div>
                              </div>

                              {/* ===================================================== */}
                              {/* EMERGENCY CONTACT */}
                              {/* ===================================================== */}
                              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <Phone className="h-5 w-5 text-red-500" />
                                  Emergency Contact
                                </h3>
                                
                                <div className="grid md:grid-cols-3 gap-5">
                                  <div className="space-y-1.5">
                                    <Label htmlFor="emergencyContactName" className="text-sm font-medium">
                                      Contact Name *
                                    </Label>
                                    <Input
                                      id="emergencyContactName"
                                      placeholder="e.g., Parent/Guardian name"
                                      value={formData.emergencyContactName}
                                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="emergencyContactPhone" className="text-sm font-medium">
                                      Contact Phone *
                                    </Label>
                                    <Input
                                      id="emergencyContactPhone"
                                      placeholder="e.g., +91 9876543210"
                                      value={formData.emergencyContactPhone}
                                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                      required
                                    />
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <Label htmlFor="emergencyContactRelation" className="text-sm font-medium">
                                      Relation *
                                    </Label>
                                    <Select
                                      value={formData.emergencyContactRelation}
                                      onValueChange={(value) => setFormData({ ...formData, emergencyContactRelation: value })}
                                      required
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select relation" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Father">Father</SelectItem>
                                        <SelectItem value="Mother">Mother</SelectItem>
                                        <SelectItem value="Guardian">Guardian</SelectItem>
                                        <SelectItem value="Sibling">Sibling</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
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

      {/* Info Modal */}
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

            <div className="p-6 space-y-6">
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

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  About This Exam
                </h3>
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {infoExam.description || "No description available for this exam."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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