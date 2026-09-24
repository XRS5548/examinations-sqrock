"use client";

import React, { useState } from "react";

import {
  PDFDownloadLink,
  PDFViewer,
} from "@react-pdf/renderer";

import InternshipCertificatePDF, {
  InternshipCertificateData,
} from "@/docs/InternshipCertificatePDF";

import {
  Search,
  Download,
  Award,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ✅ Shared helpers — no duplicate logic
import {
  computeDuration,
  formatDate,
  getSkillsForDesignation,
  getTechnologiesForDesignation,
} from "@/lib/certificate-utils";

// ==========================================
// API Response Types
// ==========================================

interface CertificateResponse {
  result: "success" | "fail";
  message?: string;
  reason?: string;

  certificate?: {
    id: number;
    examid: string;
    verificationCode: string;
    employeeId: string;
    name: string;
    email: string | null;
    phone: string | null;
    designation: string;
    department: string | null;
    internshipType: string | null;
    startDate: string;
    endDate: string;
    duration: string | null;
    performanceGrade: string | null;
    issueDate: string;
    certificateUrl: string | null;
    createdAt: string;

    universityName: string | null;
    collegeName: string | null;
    course: string | null;
    branch: string | null;
    semester: string | null;
    enrollmentNumber: string | null;
    projectName: string | null;
    technologies: string[] | null;
    skills: string[] | null;
  };
}

// ==========================================
// Page
// ==========================================

export default function CertificatesPage() {
  const [email, setEmail] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [certificate, setCertificate] =
    useState<CertificateResponse["certificate"]>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // ==========================================
  // Search Certificate
  // ==========================================

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCertificate(undefined);
    setSearched(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCertificateId = certificateId.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!cleanCertificateId) {
      setError("Please enter your certificate ID.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/certificates?email=${encodeURIComponent(
          cleanEmail
        )}&certificateId=${encodeURIComponent(cleanCertificateId)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: CertificateResponse = await response.json();

      if (
        !response.ok ||
        data.result !== "success" ||
        !data.certificate
      ) {
        setError(data.reason || "Certificate not found.");
        return;
      }

      setCertificate(data.certificate);
    } catch (err) {
      console.error("Certificate search error:", err);
      setError("Unable to verify certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Convert DB Certificate → PDF Data
  // ==========================================

  const pdfData: InternshipCertificateData | undefined = certificate
    ? {
        // =========================
        // Certificate
        // =========================
        certificateId: certificate.verificationCode,
        issueDate: formatDate(certificate.issueDate),

        // =========================
        // Company
        // =========================
        companyName: "SQROCK IT Solutions",
        companyLogo: "/logo.png",
        companyAddress: "Jaipur, Rajasthan, India",
        companyWebsite: "www.sqrock.cloud",
        companyEmail: "support@sqrock.cloud",

        // =========================
        // Intern
        // =========================
        internName: certificate.name,
        employeeId: certificate.employeeId,
        internEmail: certificate.email || undefined,

        // =========================
        // Internship
        // =========================
        designation: certificate.designation,
        department: certificate.department || undefined,
        internshipType:
          certificate.internshipType || "Industrial Training",
        mode: "remote",

        startDate: formatDate(certificate.startDate),
        endDate: formatDate(certificate.endDate),

        duration:
          certificate.duration ||
          computeDuration(
            certificate.startDate,
            certificate.endDate
          ),

        // =========================
        // Performance
        // =========================
        performanceGrade: certificate.performanceGrade || undefined,

        // ✅ Only show if really exists in DB — no fallback
        projectName: certificate.projectName || undefined,

        // ✅ Use DB values if present, else compute from designation
        technologies:
          certificate.technologies && certificate.technologies.length > 0
            ? certificate.technologies
            : getTechnologiesForDesignation(certificate.designation),

        skills:
          certificate.skills && certificate.skills.length > 0
            ? certificate.skills
            : getSkillsForDesignation(certificate.designation),

        // =========================
        // Verification
        // =========================
        verificationCode: certificate.verificationCode,
        verificationUrl: `https://www.sqrock.cloud/verify/${certificate.verificationCode}`,

        // =========================
        // Signatures
        // =========================
        authorizedPersonName: "Rohit Verma",
        authorizedPersonDesignation: "Founder",

        hrName: "SANIYA KHAN",
        hrDesignation: "Co-Founder",

        // =========================
        // Stamp / Signature Images
        // =========================
        companyStamp: "/stamp.png",
        authorizedSignature: "/rohit.png",
        hrSignature: "/saniya.png",
      }
    : undefined;

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-5xl px-4 py-12">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Award className="h-7 w-7 text-primary" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Verify Your Certificate
          </h1>

          <p className="mt-3 text-muted-foreground">
            Enter your registered email address and certificate ID to view and
            download your internship certificate.
          </p>
        </div>

        {/* Search Card */}
        <Card className="mx-auto mt-8 max-w-2xl">
          <CardHeader>
            <CardTitle>Find Certificate</CardTitle>
            <CardDescription>
              Enter the details exactly as provided in your certificate email.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSearch} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="certificateId" className="text-sm font-medium">
                  Certificate ID
                </label>
                <Input
                  id="certificateId"
                  placeholder="SQ-CERT-2026-00400"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="font-mono"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Certificate...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verify Certificate
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Empty state after search */}
        {searched && !certificate && !loading && !error && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No certificate found. Please check your email and certificate ID.
          </p>
        )}

        {/* Result */}
        {certificate && pdfData && (
          <section className="mt-10">
            {/* Verified banner + Download */}
            <div className="mb-5 flex flex-col items-start justify-between gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Certificate Verified</p>
                  <p className="text-sm text-muted-foreground">
                    {certificate.name} • {certificate.verificationCode}
                  </p>
                </div>
              </div>

              <PDFDownloadLink
                document={<InternshipCertificatePDF data={pdfData} />}
                fileName={`${certificate.verificationCode}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <Button disabled={pdfLoading}>
                    {pdfLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>

            {/* Details Card */}
            <Card className="mb-5">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Certificate ID</p>
                  <p className="mt-1 font-mono text-sm font-semibold">
                    {certificate.verificationCode}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="mt-1 font-mono text-sm font-semibold">
                    {certificate.employeeId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Designation</p>
                  <p className="mt-1 text-sm font-semibold">
                    {certificate.designation}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="mt-1 text-sm font-semibold">
                    {pdfData.duration}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Performance</p>
                  <p className="mt-1 text-sm font-semibold">
                    {certificate.performanceGrade || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatDate(certificate.startDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatDate(certificate.endDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Issue Date</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatDate(certificate.issueDate)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Preview */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Certificate Preview</CardTitle>
                <CardDescription>
                  You can preview your certificate below before downloading it.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <div className="h-[75vh] min-h-[600px] w-full">
                  <PDFViewer
                    style={{ width: "100%", height: "100%", border: 0 }}
                    showToolbar={true}
                  >
                    <InternshipCertificatePDF data={pdfData} />
                  </PDFViewer>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </section>
    </main>
  );
}