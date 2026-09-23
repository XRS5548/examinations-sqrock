"use client";

import dynamic from "next/dynamic";
import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import InternshipOfferLetterPDF, {
  InternshipOfferLetterData,
} from "@/docs/InternshipOfferLetterPDF";
import { getOrCreateOfferLetter, type RegistrationData } from "@/actions/offer-letter";

const PDFDownloadLink = dynamic(
  () =>
    import("@react-pdf/renderer").then(
      (mod) => mod.PDFDownloadLink
    ),
  {
    ssr: false,
  }
);

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
  registrationData?: RegistrationData;
}

interface InternshipOfferLetterDownloadProps {
  result: ResultData | null | undefined;
}

function formatDate(
  dateValue: string | Date | null | undefined
): string {
  if (!dateValue) return "";

  const date =
    typeof dateValue === "string"
      ? new Date(dateValue)
      : dateValue;

  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function InternshipOfferLetterDownload({
  result,
}: InternshipOfferLetterDownloadProps) {
  const [offerData, setOfferData] =
    useState<InternshipOfferLetterData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOfferData() {
      if (!result) return;

      setLoading(true);
      setError(null);

      try {
        const offerLetter = await getOrCreateOfferLetter(
          result.id,
          {
            name: result.studentName,
            email: result.studentEmail,
            rollNumber: result.rollNumber,
            examName: result.examName,
            registrationData: result.registrationData,
          }
        );

        const regData = result.registrationData;

        // Transform DB data → PDF data using ACTUAL student data
        const transformedData: InternshipOfferLetterData = {
          // =====================================================
          // OFFER LETTER INFO
          // =====================================================

          offerLetterId: offerLetter.offerLetterId,
          issueDate: formatDate(offerLetter.issueDate),
          validUntil: undefined,

          // =====================================================
          // COMPANY INFO
          // =====================================================

          companyName: "SQROCK IT Solutions",
          companyLegalName: "SQROCK IT Solutions Private Limited",
          companyLogo: "/logo.png",
          companyWebsite: "https://www.sqrock.cloud",
          companyEmail: "support@sqrock.cloud",
          companyPhone: "+91 8619819400",
          companyAddress: "Jaipur, Rajasthan",
          companyCity: "Jaipur",
          companyState: "Rajasthan",
          companyCountry: "India",

          // =====================================================
          // STUDENT INFO - FROM ACTUAL REGISTRATION DATA
          // =====================================================

          name: result.studentName || "Student",
          employeeEmail: result.studentEmail || "",
          phone: regData?.phone || undefined,
          address: regData?.address || undefined,
          city: regData?.city || undefined,
          state: regData?.state || undefined,
          country: regData?.country || undefined,

          // =====================================================
          // EDUCATION - FROM ACTUAL REGISTRATION DATA
          // =====================================================

          universityName: regData?.universityName || "",
          course: regData?.course || "",
          branch: regData?.branch || "",
          semester: regData?.semester || "",
          collegeName: regData?.collegeName || undefined,
          enrollmentNumber: regData?.enrollmentNumber || undefined,

          // =====================================================
          // INTERNSHIP INFO
          // =====================================================

          designation: offerLetter.designation || regData?.domain || "Intern",
          department: offerLetter.department || regData?.domain || "Software Development",
          internshipType: offerLetter.internshipType || "Unpaid Remote Internship",
          mode: "remote",
          internshipLocation: "Remote",
          joiningLocation: "Remote",
          startDate: formatDate(offerLetter.startDate),
          endDate: offerLetter.endDate ? formatDate(offerLetter.endDate) : "",
          duration: offerLetter.duration || regData?.preferredDuration || "1 Month",

          // =====================================================
          // REPORTING MANAGER
          // =====================================================

          reportingManager: offerLetter.reportingManager || "Rohit Verma",
          reportingManagerDesignation: offerLetter.reportingManagerDesignation || "Director",
          reportingManagerEmail: offerLetter.reportingManagerEmail || "support@sqrock.cloud",

          // =====================================================
          // COMPENSATION
          // =====================================================

          isPaid: false,
          stipend: undefined,
          salary: undefined,
          currency: undefined,
          paymentFrequency: undefined,
          paymentDate: undefined,

          // =====================================================
          // WORKING SCHEDULE
          // =====================================================

          workingHours: offerLetter.workHours || "8 hours per day",
          weeklyHours: offerLetter.weeklyHours || 40,
          shiftStartTime: offerLetter.shiftStartTime || "10:00 AM",
          shiftEndTime: offerLetter.shiftEndTime || "6:00 PM",
          breakDuration: offerLetter.breakDuration || "45 Minutes",
          workingDays: {
            sunday: false,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
          },

          // =====================================================
          // RESPONSIBILITIES
          // =====================================================

          responsibilities: (offerLetter.responsibilities as string[]) || [],

          // =====================================================
          // LEARNING OBJECTIVES
          // =====================================================

          learningObjectives: (offerLetter.learningObjectives as string[]) || [],

          // =====================================================
          // TECHNOLOGIES
          // =====================================================

          technologies: (offerLetter.technologies as string[]) || [],
          projectName: result.examName,

          // =====================================================
          // ATTENDANCE & LEAVE
          // =====================================================

          minimumAttendancePercentage: offerLetter.minimumAttendance || 80,
          allowedLeaves: offerLetter.allowedLeaves || 3,
          leavePolicy: offerLetter.leavePolicy || "",

          // =====================================================
          // CONFIDENTIALITY
          // =====================================================

          confidentialityRequired: true,
          confidentialityClause: offerLetter.confidentialityClause || "",

          // =====================================================
          // INTELLECTUAL PROPERTY
          // =====================================================

          intellectualPropertyClause: offerLetter.intellectualPropertyClause || "",

          // =====================================================
          // INTERNSHIP RULES
          // =====================================================

          noticePeriod: offerLetter.noticePeriod || "7 Days",
          terminationPolicy: offerLetter.terminationPolicy || "",
          codeOfConduct: offerLetter.codeOfConduct || "",

          // =====================================================
          // PERFORMANCE
          // =====================================================

          performanceReview: offerLetter.performanceReview || "",
          completionCriteria: offerLetter.completionCriteria || "",
          certificateEligibility: offerLetter.certificateEligibility || "",

          // =====================================================
          // COMPANY ASSETS
          // =====================================================

          companyAssetsProvided: (offerLetter.companyAssets as string[]) || [],

          // =====================================================
          // TERMS & CONDITIONS
          // =====================================================

          termsAndConditions: (offerLetter.termsAndConditions as string[]) || [],

          // =====================================================
          // HR INFORMATION
          // =====================================================

          hrName: offerLetter.hrName || "SANIYA KHAN",
          hrDesignation: offerLetter.hrDesignation || "Co-Founder",
          hrEmail: offerLetter.hrEmail || "support@sqrock.cloud",
          hrPhone: offerLetter.hrPhone || "+91 9876543210",

          // =====================================================
          // AUTHORIZED PERSON
          // =====================================================

          authorizedPersonName: offerLetter.authorizedPersonName || "Rohit Verma",
          authorizedPersonDesignation: offerLetter.authorizedPersonDesignation || "Director",
          authorizedSignature: offerLetter.authorizedSignature || "/rohit.png",
          companyStamp: offerLetter.companyStamp || "/stamp.png",

          // =====================================================
          // ACCEPTANCE
          // =====================================================

          acceptanceRequired: true,
          acceptanceDeadline: undefined,
        };

        setOfferData(transformedData);
      } catch (err) {
        console.error("Error fetching offer letter:", err);
        setError("Failed to load offer letter. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOfferData();
  }, [result]);

  if (!result) {
    return null;
  }

  const fileName = `Internship_Offer_Letter_${result.rollNumber || result.id}.pdf`;

  return (
    <Card className="mt-6 border border-red-100 dark:border-red-900/40 shadow-lg">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Internship Offer Letter
              </h4>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your official unpaid remote internship offer letter.
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  Unpaid Internship
                </span>

                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Remote
                </span>

                {offerData && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {offerData.duration}
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <Button
              disabled
              className="bg-red-600 hover:bg-red-700 text-white shrink-0"
            >
              <Download className="h-4 w-4 mr-2 animate-pulse" />
              Loading...
            </Button>
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : offerData ? (
            <PDFDownloadLink
              document={<InternshipOfferLetterPDF data={offerData} />}
              fileName={fileName}
            >
              {({ loading: pdfLoading }) => (
                <Button
                  disabled={pdfLoading}
                  className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {pdfLoading ? "Generating..." : "Download Offer Letter"}
                </Button>
              )}
            </PDFDownloadLink>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}