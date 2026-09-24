// components/pdf/InternshipOfferLetterPDF.tsx

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";

export type InternshipMode = "remote" | "hybrid" | "onsite";
export type PaymentFrequency = "monthly" | "weekly" | "one-time";
export type Currency = "INR" | "USD" | "EUR" | "GBP" | string;

export interface WorkingDays {
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
}

export interface InternshipOfferLetterData {
  // =========================
  // Offer Letter Information
  // =========================
  offerLetterId: string;
  issueDate: string;
  validUntil?: string;

  // =========================
  // Company Information
  // =========================
  companyName: string;
  companyLegalName?: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress: string;
  companyCity?: string;
  companyState?: string;
  companyCountry?: string;
  companyPostalCode?: string;
  companyRegistrationNumber?: string;
  companyGSTIN?: string;
  companyCIN?: string;

  // =========================
  // Intern Information
  // =========================
  name: string;
  employeeEmail: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;

  collegeName?: string;
  universityName?: string;
  course?: string;
  branch?: string;
  semester?: string;
  enrollmentNumber?: string;

  // =========================
  // Internship Information
  // =========================
  designation: string;
  department?: string;
  internshipType?: string;
  mode: InternshipMode;

  internshipLocation?: string;
  joiningLocation?: string;

  startDate: string;
  endDate: string;
  duration?: string;

  reportingManager?: string;
  reportingManagerDesignation?: string;
  reportingManagerEmail?: string;

  // =========================
  // Payment / Stipend
  // =========================
  isPaid: boolean;
  salary?: number;
  stipend?: number;
  currency?: Currency;
  paymentFrequency?: PaymentFrequency;
  paymentDate?: string;

  incentives?: string;
  benefits?: string[];

  // =========================
  // Working Schedule
  // =========================
  workingHours: string;
  workingDays: WorkingDays;

  shiftStartTime?: string;
  shiftEndTime?: string;
  breakDuration?: string;
  weeklyHours?: number;

  // =========================
  // Work Details
  // =========================
  jobDescription?: string;
  responsibilities?: string[];
  learningObjectives?: string[];
  technologies?: string[];
  projectName?: string;

  // =========================
  // Attendance / Leave
  // =========================
  minimumAttendancePercentage?: number;
  allowedLeaves?: number;
  leavePolicy?: string;

  // =========================
  // Internship Rules
  // =========================
  probationPeriod?: string;
  noticePeriod?: string;
  terminationPolicy?: string;
  codeOfConduct?: string;

  confidentialityRequired?: boolean;
  confidentialityClause?: string;

  intellectualPropertyClause?: string;
  nonDisclosureAgreementRequired?: boolean;

  // =========================
  // Performance
  // =========================
  performanceReview?: string;
  completionCriteria?: string;
  certificateEligibility?: string;

  // =========================
  // Assets
  // =========================
  companyAssetsProvided?: string[];

  // =========================
  // Additional Terms
  // =========================
  termsAndConditions?: string[];
  additionalNotes?: string;

  // =========================
  // Contact / HR
  // =========================
  hrName?: string;
  hrDesignation?: string;
  hrEmail?: string;
  hrPhone?: string;

  // =========================
  // Signature
  // =========================
  authorizedPersonName: string;
  authorizedPersonDesignation: string;
  authorizedSignature?: string;

  companyStamp?: string;

  // =========================
  // Acceptance
  // =========================
  acceptanceRequired?: boolean;
  acceptanceDeadline?: string;
}

interface InternshipOfferLetterPDFProps {
  data: InternshipOfferLetterData;
}

/*
 * Layout intentionally follows the uploaded reference PDF:
 * - compact A4 single-page composition
 * - thin red header rule
 * - two-column information cards
 * - compact date summary row
 * - two-column lower content
 * - acceptance bar
 * - three-part signature area
 *
 * IMPORTANT:
 * The data interface above is unchanged. Optional fields are simply hidden
 * when they are not provided, so callers do not need to be changed.
 */

const RED = "#9B3F3F";
const DARK = "#1F2937";
const MUTED = "#6B7280";
const BORDER = "#D7D9DC";
const CARD_BG = "#F8F9FA";

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 34,
    paddingHorizontal: 34,
    fontSize: 6.8,
    fontFamily: "Helvetica",
    color: DARK,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 9,
    borderBottomWidth: 1.1,
    borderBottomColor: RED,
  },

  brandBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },

  logo: {
    width: 84,
    height: 30,
    objectFit: "contain",
    marginRight: 7,
  },

  companyInfo: {
    flex: 1,
  },

  companyName: {
    fontSize: 12.5,
    fontFamily: "Helvetica-Bold",
    color: "#263142",
    marginBottom: 3,
  },

  companyMeta: {
    fontSize: 6.1,
    color: MUTED,
    marginBottom: 1.5,
  },

  website: {
    fontSize: 6.1,
    color: "#3568A8",
    textDecoration: "none",
  },

  letterMeta: {
    width: 150,
    alignItems: "flex-end",
  },

  metaText: {
    fontSize: 6.6,
    color: RED,
    marginBottom: 3,
    textAlign: "right",
  },

  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 15.5,
    textAlign: "center",
    color: "#273244",
    marginTop: 10,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },

  intro: {
    marginBottom: 9,
    fontSize: 7.4,
    color: "#303844",
  },

  bold: {
    fontFamily: "Helvetica-Bold",
  },

  topGrid: {
    flexDirection: "row",
    gap: 9,
    alignItems: "flex-start",
  },

  topColumn: {
    flex: 1,
    minWidth: 0,
  },

  card: {
    borderWidth: 0.65,
    borderColor: BORDER,
    borderRadius: 3,
    padding: 7,
    marginBottom: 3,
    backgroundColor: CARD_BG,
  },

  cardTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: RED,
    paddingBottom: 4,
    marginBottom: 3,
    borderBottomWidth: 0.55,
    borderBottomColor: "#E1E2E5",
  },

  row: {
    flexDirection: "row",
    marginBottom: 2.5,
    minHeight: 7,
  },

  rowLabel: {
    width: "35%",
    fontFamily: "Helvetica-Bold",
    color: "#667085",
    fontSize: 6.8,
  },

  rowValue: {
    width: "65%",
    color: "#28313D",
    fontSize: 6.8,
  },

  dateGrid: {
    flexDirection: "row",
    gap: 9,
    marginTop: 1,
    marginBottom: 3,
  },

  dateCard: {
    flex: 1,
    borderWidth: 0.65,
    borderColor: BORDER,
    borderRadius: 2.5,
    paddingVertical: 5.5,
    paddingHorizontal: 5,
  },

  dateValue: {
    fontSize: 8.1,
    fontFamily: "Helvetica-Bold",
    color: "#263142",
    marginBottom: 1,
  },

  dateLabel: {
    fontSize: 6.1,
    color: MUTED,
    textTransform: "uppercase",
  },

  lowerGrid: {
    flexDirection: "row",
    gap: 18,
    alignItems: "flex-start",
  },

  lowerColumn: {
    flex: 1,
    minWidth: 0,
  },

  section: {
    marginBottom: 7,
  },

  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.1,
    color: RED,
    marginBottom: 3,
  },

  listItem: {
    flexDirection: "row",
    marginBottom: 2.2,
  },

  bullet: {
    width: 8,
    color: RED,
    fontSize: 6.6,
  },

  listText: {
    flex: 1,
    fontSize: 6.8,
    color: "#303844",
  },

  compactText: {
    fontSize: 6.8,
    color: "#303844",
    marginBottom: 2.5,
  },

  acceptanceBox: {
    marginTop: 6,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderWidth: 0.65,
    borderColor: BORDER,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  acceptanceText: {
    flex: 1,
    paddingRight: 10,
  },

  acceptanceTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.4,
    marginBottom: 3,
    color: "#303844",
  },

  acceptanceBody: {
    fontSize: 6.6,
    color: "#3D4652",
  },

  validBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#D9F7E3",
  },

  validBadgeText: {
    fontSize: 6.2,
    fontFamily: "Helvetica-Bold",
    color: "#28754A",
  },

  signatureSection: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  signatureBlock: {
    width: "31%",
  },

  signatureCenter: {
    width: "18%",
    alignItems: "center",
  },

  signatureImage: {
    width: 82,
    height: 28,
    objectFit: "contain",
    marginBottom: 3,
  },

  signatureLine: {
    borderTopWidth: 0.75,
    borderTopColor: "#6B7280",
    marginTop: 22,
    paddingTop: 4,
  },

  signatureName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.7,
    marginBottom: 1,
  },

  signatureMeta: {
    fontSize: 6.2,
    color: "#3D4652",
    marginBottom: 1,
  },

  stamp: {
    width: 82,
    height: 82,
    objectFit: "contain",
  },

  hrSection: {
    marginTop: 6,
    marginBottom: 3,
  },

  footer: {
    position: "absolute",
    bottom: 12,
    left: 34,
    right: 34,
    fontSize: 6.1,
    color: "#7A7F87",
    borderTopWidth: 0.5,
    borderTopColor: "#D8DADD",
    paddingTop: 4,
    flexDirection: "row",
    gap: 8,
  },

  footerText: {
    flex: 1,
    maxLines: 1,
    textOverflow: "ellipsis",
  },

  footerPageText: {
    flex: 1,
    maxLines: 1,
    textAlign: "right",
  },
});

const dayLabels: Record<keyof WorkingDays, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

const formatCurrency = (
  value?: number,
  currency: Currency = "INR"
): string => {
  if (value === undefined || value === null) return "N/A";

  if (currency === "INR") {
    return `₹${value.toLocaleString("en-IN")}`;
  }

  return `${currency} ${value.toLocaleString()}`;
};

const displayMode = (mode: InternshipMode) => mode.toUpperCase();

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value === "number" && Number.isNaN(value))
  ) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValue}>
        {typeof value === "string" || typeof value === "number" ? (
          <Text>{value}</Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
};

const Card = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const BulletList = ({ items }: { items?: string[] }) => {
  if (!items?.length) return null;

  return (
    <View>
      {items.map((item, index) => (
        <View style={styles.listItem} key={`${item}-${index}`}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

const WorkingDaysText = ({ days }: { days: WorkingDays }) => {
  const active = (Object.keys(days) as Array<keyof WorkingDays>)
    .filter((day) => days[day])
    .map((day) => dayLabels[day].toUpperCase());

  return <Text>{active.length ? active.join(", ") : "N/A"}</Text>;
};

export default function InternshipOfferLetterPDF({
  data,
}: InternshipOfferLetterPDFProps) {
  const compensation =
    data.salary !== undefined ? data.salary : data.stipend;

  const hasHR = Boolean(data.hrName || data.hrEmail || data.hrPhone);

  return (
    <Document
      title={`Internship Offer Letter - ${data.name}`}
      author={data.companyName}
      subject="Internship Offer Letter"
      keywords="internship, offer letter"
    >
      <Page size="A4" style={styles.page}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            {data.companyLogo && (
              <Image src={data.companyLogo} style={styles.logo} />
            )}

            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{data.companyName}</Text>

              {data.companyWebsite && (
                <Link src={data.companyWebsite} style={styles.website}>
                  {data.companyWebsite}
                </Link>
              )}

              <Text style={styles.companyMeta}>
                {data.companyEmail || ""}
                {data.companyEmail && data.companyPhone ? " | " : ""}
                {data.companyPhone || ""}
              </Text>
            </View>
          </View>

          <View style={styles.letterMeta}>
            <Text style={styles.metaText}>
              Offer ID: {data.offerLetterId}
            </Text>
            <Text style={styles.metaText}>
              Issued: {data.issueDate}
            </Text>
            {data.validUntil && (
              <Text style={styles.metaText}>
                Valid Until: {data.validUntil}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.title}>Internship Offer Letter</Text>

        <Text style={styles.intro}>
          Dear <Text style={styles.bold}>{data.name}</Text>, we are pleased to
          offer you the <Text style={styles.bold}>{data.designation}</Text>{" "}
          internship with{" "}
          <Text style={styles.bold}>{data.companyName}</Text>
          {data.department ? ` in the ${data.department} department` : ""}.
          This letter confirms the appointment, schedule and principal terms
          of the internship.
        </Text>

        {/* ================= TOP INFORMATION CARDS ================= */}
        <View style={styles.topGrid}>
          <View style={styles.topColumn}>
            <Card title="Candidate Details">
              <InfoRow label="Name" value={data.name} />
              <InfoRow label="Email" value={data.employeeEmail} />
              <InfoRow label="Phone" value={data.phone} />

              {(data.course || data.branch || data.semester) && (
                <InfoRow
                  label="Education"
                  value={[
                    data.course,
                    data.branch,
                    data.semester
                      ? `${data.semester}${/^\d+$/.test(data.semester) ? " Semester" : ""}`
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(" | ")}
                />
              )}

              {/* College intentionally hidden in the reference layout. */}
              {/* University intentionally hidden to keep the reference one-page layout. */}
              <InfoRow
                label="Enrollment No."
                value={data.enrollmentNumber}
              />
            </Card>

            <Card title="Work Schedule">
              <InfoRow
                label="Mode"
                value={displayMode(data.mode)}
              />
              <InfoRow label="Hours" value={data.workingHours} />
              {(data.shiftStartTime || data.shiftEndTime) && (
                <InfoRow
                  label="Shift"
                  value={
                    data.shiftStartTime && data.shiftEndTime
                      ? `${data.shiftStartTime} - ${data.shiftEndTime}`
                      : data.shiftStartTime || data.shiftEndTime
                  }
                />
              )}
              <InfoRow
                label="Working Days"
                value={<WorkingDaysText days={data.workingDays} />}
              />
              <InfoRow label="Break" value={data.breakDuration} />
              <InfoRow
                label="Weekly Hours"
                value={
                  data.weeklyHours !== undefined
                    ? `${data.weeklyHours} hours`
                    : undefined
                }
              />
            </Card>
          </View>

          <View style={styles.topColumn}>
            <Card title="Internship Details">
              <InfoRow label="Designation" value={data.designation} />
              <InfoRow label="Department" value={data.department} />
              {/* <InfoRow label="Type" value={data.internshipType} /> */}
              {/* Work mode is already shown in the Work Schedule card. */}
              <InfoRow label="Work Location" value={data.internshipLocation} />
              {/* Joining location intentionally hidden in the reference layout. */}
              <InfoRow label="Start Date" value={data.startDate} />
              <InfoRow label="End Date" value={data.endDate} />
              <InfoRow label="Duration" value={data.duration} />
              <InfoRow
                label="Manager"
                value={
                  data.reportingManager
                    ? `${data.reportingManager}${
                        data.reportingManagerDesignation
                          ? `, ${data.reportingManagerDesignation}`
                          : ""
                      }`
                    : undefined
                }
              />
            </Card>

            <Card title="Compensation & Access">
              {/* <InfoRow
                label="Compensation"
                value={
                  data.isPaid
                    ? formatCurrency(
                        compensation,
                        data.currency || "INR"
                      )
                    : "Unpaid internship"
                }
              /> */}

              {data.isPaid && (
                <>
                  <InfoRow
                    label="Payment"
                    value={data.paymentFrequency}
                  />
                  <InfoRow
                    label="Payment Date"
                    value={data.paymentDate}
                  />
                </>
              )}

              <InfoRow
                label="Attendance"
                value={
                  data.minimumAttendancePercentage !== undefined
                    ? `${data.minimumAttendancePercentage}% minimum`
                    : undefined
                }
              />
              <InfoRow
                label="Assets"
                value={
                  data.companyAssetsProvided?.length
                    ? data.companyAssetsProvided.slice(0, 1).join(", ")
                    : undefined
                }
              />
            </Card>
          </View>
        </View>

        {/* ================= DATE SUMMARY ================= */}
        <View style={styles.dateGrid}>
          <View style={styles.dateCard}>
            <Text style={styles.dateValue}>{data.startDate}</Text>
            <Text style={styles.dateLabel}>Start Date</Text>
          </View>

          <View style={styles.dateCard}>
            <Text style={styles.dateValue}>{data.endDate}</Text>
            <Text style={styles.dateLabel}>End Date</Text>
          </View>

          <View style={styles.dateCard}>
            <Text style={styles.dateValue}>{data.duration || "N/A"}</Text>
            <Text style={styles.dateLabel}>Duration</Text>
          </View>
        </View>

        {/* ================= LOWER CONTENT ================= */}
        <View style={styles.lowerGrid}>
          <View style={styles.lowerColumn}>
            {data.responsibilities?.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Responsibilities</Text>
                <BulletList items={data.responsibilities?.slice(0, 3)} />
              </View>
            ) : null}

            {data.learningObjectives?.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Learning Objectives</Text>
                <BulletList items={data.learningObjectives?.slice(0, 2)} />
              </View>
            ) : null}

            {data.technologies?.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Technologies</Text>
                <Text style={styles.compactText}>
                  {data.technologies.join(", ")}
                </Text>
              </View>
            ) : null}

            {data.leavePolicy ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Leave Policy</Text>
                <Text style={styles.compactText}>{data.leavePolicy}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.lowerColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Terms & Compliance</Text>

              {data.confidentialityRequired && (
                <View style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>
                    Confidentiality: Company, client and project information
                    must remain protected.
                  </Text>
                </View>
              )}

              {data.terminationPolicy && (
                <View style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>
                    Termination: {data.terminationPolicy}
                  </Text>
                </View>
              )}

              {data.codeOfConduct && (
                <View style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>
                    Conduct: {data.codeOfConduct}
                  </Text>
                </View>
              )}

              {data.noticePeriod && (
                <View style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>
                    Notice: {data.noticePeriod}
                  </Text>
                </View>
              )}

              {data.probationPeriod && (
                <View style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>
                    Probation: {data.probationPeriod}
                  </Text>
                </View>
              )}

              <BulletList items={data.termsAndConditions?.slice(0, 4)} />
            </View>

            {(data.performanceReview ||
              data.completionCriteria ||
              data.certificateEligibility) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Performance & Completion
                </Text>

                {data.performanceReview && (
                  <Text style={styles.compactText}>
                    <Text style={styles.bold}>Performance: </Text>
                    {data.performanceReview}
                  </Text>
                )}

                {data.completionCriteria && (
                  <Text style={styles.compactText}>
                    <Text style={styles.bold}>Completion: </Text>
                    {data.completionCriteria}
                  </Text>
                )}

                {data.certificateEligibility && (
                  <Text style={styles.compactText}>
                    <Text style={styles.bold}>Certificate: </Text>
                    {data.certificateEligibility}
                  </Text>
                )}
              </View>
            )}

            {data.additionalNotes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <Text style={styles.compactText}>{data.additionalNotes}</Text>
              </View>
            )}

            {hasHR && (
              <View style={styles.hrSection}>
                <Text style={styles.sectionTitle}>HR Contact</Text>
                {data.hrName && (
                  <Text style={styles.compactText}>
                    {data.hrName}
                    {data.hrDesignation
                      ? `, ${data.hrDesignation}`
                      : ""}
                  </Text>
                )}
                {data.hrEmail && (
                  <Text style={styles.compactText}>
                    {data.hrEmail}
                  </Text>
                )}
                {data.hrPhone && (
                  <Text style={styles.compactText}>
                    {data.hrPhone}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* ================= ACCEPTANCE ================= */}
        {data.acceptanceRequired !== false && (
          <View style={styles.acceptanceBox}>
            <View style={styles.acceptanceText}>
              <Text style={styles.acceptanceTitle}>Acceptance</Text>
              <Text style={styles.acceptanceBody}>
                By accepting, you confirm that you have read and agreed to the
                appointment and terms stated in this offer.
                {data.acceptanceDeadline
                  ? ` Acceptance deadline: ${data.acceptanceDeadline}.`
                  : ""}
              </Text>
            </View>

            <View style={styles.validBadge}>
              <Text style={styles.validBadgeText}>VALID OFFER</Text>
            </View>
          </View>
        )}

        {/* ================= SIGNATURES ================= */}
        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.signatureBlock}>
            {data.authorizedSignature ? (
              <Image
                src={data.authorizedSignature}
                style={styles.signatureImage}
              />
            ) : (
              <View style={styles.signatureLine} />
            )}

            <Text style={styles.signatureName}>
              {data.authorizedPersonName}
            </Text>
            <Text style={styles.signatureMeta}>
              {data.authorizedPersonDesignation}
            </Text>
            <Text style={styles.signatureMeta}>{data.companyName}</Text>
          </View>

          <View style={styles.signatureCenter}>
            {data.companyStamp ? (
              <Image src={data.companyStamp} style={styles.stamp} />
            ) : (
              <Text style={styles.signatureMeta}> </Text>
            )}
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{data.name}</Text>
            <Text style={styles.signatureMeta}>Intern Signature and Date</Text>
          </View>
        </View>

        {/* ================= FOOTER ================= */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {data.companyName} | Offer ID: {data.offerLetterId}
          </Text>

          <Text
            style={styles.footerPageText}
            render={({ pageNumber, totalPages }) =>
              `Computer-generated offer | Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
