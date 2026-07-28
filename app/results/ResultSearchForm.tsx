// components/results/ResultSearchForm.tsx
"use client";

import { useState, useRef } from "react";
import { searchStudentResult } from "@/actions/results-public";
import { 
  Loader2, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  User, 
  Mail, 
  Award, 
  Calendar, 
  TrendingUp, 
  Users,
  FileText,
  Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

interface ResultData {
  id: number;
  rollNumber: string;
  studentName: string;
  studentEmail: string;
  examName: string;
  examTotalMarks: number;
  score: number;
  percentage: number;
  cheating: boolean;
  submittedAt: Date;
  rank?: number;
}

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#dc2626',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  rollNumberBox: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  rollNumberLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  rollNumberValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  infoLabel: {
    width: 120,
    fontSize: 12,
    color: '#6b7280',
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    color: '#1f2937',
    fontWeight: 'medium',
  },
  statsGrid: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusPass: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusFail: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  statusCheating: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  watermark: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    fontSize: 8,
    color: '#e5e7eb',
    transform: 'rotate(-30deg)',
  },
});

// PDF Document Component
const ResultPDF = ({ result }: { result: ResultData }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <View>
          <Text style={pdfStyles.headerTitle}>Result Card</Text>
          <Text style={pdfStyles.headerSubtitle}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>
        <View style={pdfStyles.headerRight}>
          <Text style={{ color: '#ffffff', fontSize: 10, opacity: 0.8 }}>ID: #{result.id}</Text>
        </View>
      </View>

      {/* Roll Number */}
      <View style={pdfStyles.rollNumberBox}>
        <Text style={pdfStyles.rollNumberLabel}>Roll Number</Text>
        <Text style={pdfStyles.rollNumberValue}>{result.rollNumber}</Text>
      </View>

      {/* Student Info */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Student Details</Text>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Name:</Text>
          <Text style={pdfStyles.infoValue}>{result.studentName}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Email:</Text>
          <Text style={pdfStyles.infoValue}>{result.studentEmail}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Exam:</Text>
          <Text style={pdfStyles.infoValue}>{result.examName}</Text>
        </View>
        <View style={pdfStyles.infoRow}>
          <Text style={pdfStyles.infoLabel}>Submitted:</Text>
          <Text style={pdfStyles.infoValue}>
            {new Date(result.submittedAt).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Performance</Text>
        <View style={pdfStyles.statsGrid}>
          <View style={pdfStyles.statBox}>
            <Text style={pdfStyles.statValue}>{result.score}</Text>
            <Text style={pdfStyles.statLabel}>Score</Text>
          </View>
          <View style={pdfStyles.statBox}>
            <Text style={pdfStyles.statValue}>{result.percentage.toFixed(1)}%</Text>
            <Text style={pdfStyles.statLabel}>Percentage</Text>
          </View>
          <View style={pdfStyles.statBox}>
            <Text style={pdfStyles.statValue}>{result.rank || 'N/A'}</Text>
            <Text style={pdfStyles.statLabel}>Rank</Text>
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={pdfStyles.statusRow}>
        <View>
          {result.cheating ? (
            <Text style={[pdfStyles.statusBadge, pdfStyles.statusCheating]}>
              ⚠️ Cheating Detected
            </Text>
          ) : result.percentage >= 40 ? (
            <Text style={[pdfStyles.statusBadge, pdfStyles.statusPass]}>
              ✅ Pass
            </Text>
          ) : (
            <Text style={[pdfStyles.statusBadge, pdfStyles.statusFail]}>
              ❌ Fail
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 12, color: '#6b7280' }}>
          {result.score} / {result.examTotalMarks} marks
        </Text>
      </View>

      {/* Footer */}
      <View style={pdfStyles.footer}>
        <Text style={pdfStyles.footerText}>
          This is a computer-generated document. No signature is required.
        </Text>
      </View>

      {/* Watermark */}
      <Text style={pdfStyles.watermark}>OFFICIAL</Text>
    </Page>
  </Document>
);

export function ResultSearchForm() {
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("rollNumber", rollNumber);
      formData.append("email", email);

      const data = await searchStudentResult(formData);
      
      if (data.success && data.result) {
        const transformedResult: ResultData = {
          id: data.result.id,
          rollNumber: data.result.rollNumber || "N/A",
          studentName: data.result.studentName || "N/A",
          studentEmail: data.result.studentEmail,
          examName: data.result.examName || "Unknown Exam",
          examTotalMarks: data.result.examTotalMarks,
          score: data.result.score,
          percentage: data.result.percentage,
          cheating: data.result.cheating,
          submittedAt: data.result.submittedAt || new Date(),
          rank: data.result.rank || undefined,
        };
        setResult(transformedResult);
      } else {
        setError(data.error?.toString() || "No result found. Please check your credentials.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search Card */}
      <Card className="border-0 shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50">
        <CardHeader className="text-center border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Find Your Result
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your roll number and email to view your result
          </p>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Roll Number *
              </Label>
              <Input
                id="rollNumber"
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter your roll number"
                className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-500" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                required
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-6 text-lg rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Check Result →
                </>
              )}
            </Button>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Result Card */}
      {result && (
        <div ref={resultRef} className="mt-8">
          <Card className="border-2 border-red-200 dark:border-red-800/50 shadow-2xl shadow-red-500/10 dark:shadow-red-900/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6" />
                    <h3 className="text-xl font-bold">Result Card</h3>
                  </div>
                  <p className="text-sm text-red-100 mt-1">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.print()}
                    variant="secondary"
                    className="bg-white/20 text-white hover:bg-white/30 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <PDFDownloadLink
                    document={<ResultPDF result={result} />}
                    fileName={`Result_${result.rollNumber}_${result.examName.replace(/\s/g, "_")}.pdf`}
                  >
                    {({ loading: pdfLoading }) => (
                      <Button
                        disabled={pdfLoading}
                        variant="secondary"
                        className="bg-white text-red-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700 font-semibold"
                      >
                        {pdfLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </>
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              {/* Student Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Student Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{result.studentName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Roll Number
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">{result.rollNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    Email Address
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{result.studentEmail}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    Exam Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{result.examName}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Submitted On
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(result.submittedAt).toLocaleDateString()} at {new Date(result.submittedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{result.score}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Score
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{result.percentage.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Percentage
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{result.rank || "N/A"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Rank
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {result.cheating ? (
                    <Badge variant="destructive" className="px-3 py-1.5 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1.5" />
                      ⚠️ Cheating Detected
                    </Badge>
                  ) : result.percentage >= 40 ? (
                    <Badge className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Pass
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="px-3 py-1.5 text-sm">
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Fail
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {result.score} / {result.examTotalMarks} marks
                </div>
              </div>
            </CardContent>
            
            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-800/30 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                This is a computer-generated document. No signature is required.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}