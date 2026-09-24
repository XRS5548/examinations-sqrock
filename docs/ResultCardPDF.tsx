import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export type ResultCardPdfData = {
  resultId: number;
  studentName: string;
  rollNumber: string;
  studentEmail: string;
  examName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passingScore: number;
  status: "PASS" | "FAIL" | "REVIEW";
  submittedAt: string;
  rank: number | null;
};

const colors = {
  brand: "#DC2626",
  brandDark: "#991B1B",
  ink: "#172033",
  muted: "#667085",
  border: "#E4E7EC",
  surface: "#F8FAFC",
  success: "#15803D",
  successSurface: "#DCFCE7",
  danger: "#B42318",
  dangerSurface: "#FEE4E2",
  review: "#B54708",
  reviewSurface: "#FEF0C7",
};

const styles = StyleSheet.create({
  page: {
    padding: 34,
    backgroundColor: "#FFFFFF",
    color: colors.ink,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  accent: {
    height: 8,
    backgroundColor: colors.brand,
  },
  header: {
    marginTop: 24,
    padding: 22,
    backgroundColor: colors.ink,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontFamily: "Helvetica-Bold",
  },
  subtitle: {
    color: "#D0D5DD",
    fontSize: 9,
    marginTop: 7,
  },
  resultId: {
    color: "#D0D5DD",
    fontSize: 8,
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: "flex-end",
    marginTop: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  passBadge: {
    color: colors.success,
    backgroundColor: colors.successSurface,
  },
  failBadge: {
    color: colors.danger,
    backgroundColor: colors.dangerSurface,
  },
  reviewBadge: {
    color: colors.review,
    backgroundColor: colors.reviewSurface,
  },
  candidateSection: {
    marginTop: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: "50%",
    paddingRight: 12,
    marginBottom: 15,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  scoreSection: {
    marginTop: 18,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 10,
  },
  scoreItem: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  scoreLabel: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  resultSummary: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 8,
  },
  summaryValue: {
    marginTop: 3,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    color: colors.muted,
    fontSize: 7.5,
  },
});

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function statusStyle(status: ResultCardPdfData["status"]) {
  if (status === "PASS") return styles.passBadge;
  if (status === "REVIEW") return styles.reviewBadge;
  return styles.failBadge;
}

export default function ResultCardPDF({ data }: { data: ResultCardPdfData }) {
  return (
    <Document
      title={`Result - ${data.rollNumber}`}
      author="SQROCK IT Solutions"
      subject="Examination Result"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.accent} />
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>SQROCK IT Solutions</Text>
            <Text style={styles.title}>Examination Result</Text>
            <Text style={styles.subtitle}>
              Official computer-generated examination result card
            </Text>
          </View>
          <View>
            <Text style={styles.resultId}>RESULT ID</Text>
            <Text style={styles.title}>#{String(data.resultId).padStart(6, "0")}</Text>
          </View>
        </View>

        <View style={styles.candidateSection}>
          <Text style={styles.sectionTitle}>Candidate Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Student Name</Text>
              <Text style={styles.detailValue}>{data.studentName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Roll Number</Text>
              <Text style={styles.detailValue}>{data.rollNumber}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue}>{data.studentEmail}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rank</Text>
              <Text style={styles.detailValue}>{data.rank ?? "Not available"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Examination</Text>
              <Text style={styles.detailValue}>{data.examName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Submitted On</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(data.submittedAt)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.scoreSection}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{data.score}</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{data.totalMarks}</Text>
              <Text style={styles.scoreLabel}>Total Marks</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{data.percentage.toFixed(2)}%</Text>
              <Text style={styles.scoreLabel}>Percentage</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{data.passingScore}</Text>
              <Text style={styles.scoreLabel}>Passing Marks</Text>
            </View>
          </View>

          <View style={styles.resultSummary}>
            <View>
              <Text style={styles.summaryLabel}>Result Status</Text>
              <Text style={[styles.statusBadge, statusStyle(data.status)]}>
                {data.status}
              </Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Score Summary</Text>
              <Text style={styles.summaryValue}>
                {data.score} out of {data.totalMarks}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This document was generated electronically and does not require a
            physical signature.
          </Text>
          <Text style={styles.footerText}>sqrock.cloud</Text>
        </View>
      </Page>
    </Document>
  );
}
