// components/dashboard/exams/students/AssignedStudentsTable.tsx
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Trash2,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeStudentFromExam } from "@/actions/examStudents";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

type Assignment = {
  id: number;
  examId: number;
  studentId: number;
  rollNumber: string | null;
  domain: string | null;
  score: number | null;
  status: "not_started" | "in_progress" | "completed" | "failed" | null;
  cheating: boolean | null;
  startedAt: Date | null;
  submittedAt: Date | null;

  // Personal Details
  gender: string | null;

  // Education Details
  universityName: string | null;
  collegeName: string | null;
  course: string | null;
  branch: string | null;
  semester: string | null;
  enrollmentNumber: string | null;
  graduationYear: number | null;

  // Address Details
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;

  // Preferences
  preferredStartDate: string | null;
  preferredDuration: string | null;

  // Emergency Contact
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;

  student: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    dob: string | null;
  } | null;
};

interface AssignedStudentsTableProps {
  examId: number;
  initialAssignments: Assignment[];
}

// =====================================================
// COMPONENT
// =====================================================

export function AssignedStudentsTable({
  examId,
  initialAssignments,
}: AssignedStudentsTableProps) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);

  // Pagination + Search
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter
  const filteredAssignments = useMemo(() => {
    if (!searchTerm.trim()) return assignments;
    const term = searchTerm.toLowerCase().trim();

    return assignments.filter((a) => {
      return (
        a.student?.name?.toLowerCase().includes(term) ||
        a.student?.email?.toLowerCase().includes(term) ||
        a.student?.phone?.toLowerCase().includes(term) ||
        a.rollNumber?.toLowerCase().includes(term) ||
        a.domain?.toLowerCase().includes(term) ||
        a.universityName?.toLowerCase().includes(term) ||
        a.collegeName?.toLowerCase().includes(term) ||
        a.course?.toLowerCase().includes(term) ||
        a.branch?.toLowerCase().includes(term) ||
        a.enrollmentNumber?.toLowerCase().includes(term) ||
        a.city?.toLowerCase().includes(term) ||
        a.state?.toLowerCase().includes(term) ||
        a.status?.toLowerCase().includes(term)
      );
    });
  }, [assignments, searchTerm]);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredAssignments.length);

  const paginatedAssignments = useMemo(
    () => filteredAssignments.slice(startIndex, endIndex),
    [filteredAssignments, startIndex, endIndex]
  );

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleRemove = async (registrationId: number) => {
    setLoading(true);
    try {
      const result = await removeStudentFromExam(registrationId);
      if (result.success) {
        toast.success("Student removed from exam");
        setAssignments(assignments.filter((a) => a.id !== registrationId));
        setRemovingId(null);
      } else {
        toast.error(result.error || "Failed to remove student");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600">In Progress</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "failed":
        return "Failed";
      default:
        return "Not Started";
    }
  };

  const formatDateStr = (val: string | Date | null | undefined) => {
    if (!val) return "N/A";
    try {
      return format(new Date(val), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatDateTimeStr = (val: string | Date | null | undefined) => {
    if (!val) return "N/A";
    try {
      return format(new Date(val), "MMM dd, yyyy HH:mm:ss");
    } catch {
      return "N/A";
    }
  };

  // =====================================================
  // EXPORT FUNCTIONS - FULL DATA
  // =====================================================

  const exportToCSV = () => {
    const headers = [
      // Basic
      "S.No",
      "Roll Number",
      // Personal
      "Student Name",
      "Email",
      "Phone",
      "Date of Birth",
      "Gender",
      // Education
      "University Name",
      "College Name",
      "Course",
      "Branch",
      "Semester",
      "Enrollment Number",
      "Graduation Year",
      // Address
      "Address",
      "City",
      "State",
      "Country",
      "Pincode",
      // Domain & Preferences
      "Domain",
      "Preferred Start Date",
      "Preferred Duration",
      // Emergency Contact
      "Emergency Contact Name",
      "Emergency Contact Phone",
      "Emergency Contact Relation",
      // Exam Status
      "Score",
      "Status",
      "Cheating Status",
      "Started At",
      "Submitted At",
    ];

    const rows = filteredAssignments.map((a, index) => [
      index + 1,
      a.rollNumber || "N/A",
      a.student?.name || "N/A",
      a.student?.email || "N/A",
      a.student?.phone || "N/A",
      formatDateStr(a.student?.dob),
      a.gender || "N/A",
      a.universityName || "N/A",
      a.collegeName || "N/A",
      a.course || "N/A",
      a.branch || "N/A",
      a.semester || "N/A",
      a.enrollmentNumber || "N/A",
      a.graduationYear ?? "N/A",
      a.address || "N/A",
      a.city || "N/A",
      a.state || "N/A",
      a.country || "N/A",
      a.pincode || "N/A",
      a.domain || "N/A",
      formatDateStr(a.preferredStartDate),
      a.preferredDuration || "N/A",
      a.emergencyContactName || "N/A",
      a.emergencyContactPhone || "N/A",
      a.emergencyContactRelation || "N/A",
      a.score ?? 0,
      getStatusText(a.status),
      a.cheating ? "Flagged for Cheating" : "Clean",
      formatDateTimeStr(a.startedAt),
      formatDateTimeStr(a.submittedAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            if (
              str.includes(",") ||
              str.includes('"') ||
              str.includes("\n")
            ) {
              return `"${str.replace(/"/g, '""').replace(/\n/g, " ")}"`;
            }
            return str;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `assigned_students_exam_${examId}_${format(
        new Date(),
        "yyyy-MM-dd_HH-mm-ss"
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredAssignments.length} students to CSV`);
  };

  const exportToJSON = () => {
    const exportData = filteredAssignments.map((a) => ({
      // Basic
      id: a.id,
      rollNumber: a.rollNumber,
      studentId: a.studentId,

      // Personal
      studentName: a.student?.name,
      studentEmail: a.student?.email,
      studentPhone: a.student?.phone,
      dateOfBirth: a.student?.dob,
      gender: a.gender,

      // Education
      education: {
        universityName: a.universityName,
        collegeName: a.collegeName,
        course: a.course,
        branch: a.branch,
        semester: a.semester,
        enrollmentNumber: a.enrollmentNumber,
        graduationYear: a.graduationYear,
      },

      // Address
      address: {
        address: a.address,
        city: a.city,
        state: a.state,
        country: a.country,
        pincode: a.pincode,
      },

      // Domain & Preferences
      domain: a.domain,
      preferredStartDate: a.preferredStartDate,
      preferredDuration: a.preferredDuration,

      // Emergency Contact
      emergencyContact: {
        name: a.emergencyContactName,
        phone: a.emergencyContactPhone,
        relation: a.emergencyContactRelation,
      },

      // Exam Status
      score: a.score,
      status: a.status,
      cheating: a.cheating,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
    }));

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `assigned_students_exam_${examId}_${format(
        new Date(),
        "yyyy-MM-dd_HH-mm-ss"
      )}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredAssignments.length} students to JSON`);
  };

  const goToPage = (page: number) => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(safePage);
  };

  // =====================================================
  // EMPTY STATE
  // =====================================================

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No students assigned</h3>
        <p className="text-muted-foreground mt-2">
          Select students from the left panel to assign them to this exam
        </p>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <div className="space-y-4">
        {/* ============ HEADER ============ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm">
              <span className="font-semibold text-foreground">
                Total: {assignments.length}
              </span>
              {searchTerm && filteredAssignments.length !== assignments.length && (
                <span className="text-muted-foreground ml-2">
                  (Filtered: {filteredAssignments.length})
                </span>
              )}
            </div>

            {filteredAssignments.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}–{endIndex} of {filteredAssignments.length}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, university..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 w-[280px]"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export ({filteredAssignments.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  Export as CSV (Full Data)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToJSON}>
                  Export as JSON (Full Data)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ============ TABLE ============ */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>University</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Grad Year</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cheating</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAssignments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={22}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No students found matching "{searchTerm}"
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAssignments.map((assignment, idx) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {startIndex + idx + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {assignment.rollNumber || "—"}
                    </TableCell>
                    <TableCell className="font-medium text-sm whitespace-nowrap">
                      {assignment.student?.name || "—"}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {assignment.student?.email || "—"}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {assignment.student?.phone || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {assignment.gender || "—"}
                    </TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate" title={assignment.universityName || ""}>
                      {assignment.universityName || "—"}
                    </TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate" title={assignment.collegeName || ""}>
                      {assignment.collegeName || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {assignment.course || "—"}
                    </TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate" title={assignment.branch || ""}>
                      {assignment.branch || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {assignment.semester || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {assignment.enrollmentNumber || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {assignment.graduationYear ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {assignment.city || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {assignment.state || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {assignment.domain || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {assignment.preferredDuration || "—"}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {assignment.score ?? 0}
                    </TableCell>
                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                    <TableCell>
                      {assignment.cheating ? (
                        <Badge variant="destructive" className="text-xs">
                          Flagged
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Clean
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {assignment.submittedAt
                        ? format(new Date(assignment.submittedAt), "MMM dd, HH:mm")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingAssignment(assignment)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700"
                          title="View full details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setRemovingId(assignment.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          title="Remove student"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ============ PAGINATION ============ */}
        {filteredAssignments.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="80">80</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground mr-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ============ VIEW FULL DETAILS DIALOG ============ */}
      <Dialog
        open={!!viewingAssignment}
        onOpenChange={(open) => !open && setViewingAssignment(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Student Full Details
            </DialogTitle>
            <DialogDescription>
              Complete information collected during exam registration
            </DialogDescription>
          </DialogHeader>

          {viewingAssignment && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-4 border">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {viewingAssignment.student?.name || "N/A"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {viewingAssignment.student?.email || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Roll Number</p>
                    <p className="font-mono font-semibold text-sm">
                      {viewingAssignment.rollNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <Section title="Personal Details">
                <DetailRow label="Full Name" value={viewingAssignment.student?.name} />
                <DetailRow label="Email" value={viewingAssignment.student?.email} />
                <DetailRow label="Phone" value={viewingAssignment.student?.phone} />
                <DetailRow
                  label="Date of Birth"
                  value={formatDateStr(viewingAssignment.student?.dob)}
                />
                <DetailRow label="Gender" value={viewingAssignment.gender} />
              </Section>

              {/* Education Details */}
              <Section title="Education Details">
                <DetailRow label="University" value={viewingAssignment.universityName} />
                <DetailRow label="College" value={viewingAssignment.collegeName} />
                <DetailRow label="Course" value={viewingAssignment.course} />
                <DetailRow label="Branch" value={viewingAssignment.branch} />
                <DetailRow label="Semester" value={viewingAssignment.semester} />
                <DetailRow
                  label="Enrollment Number"
                  value={viewingAssignment.enrollmentNumber}
                />
                <DetailRow
                  label="Graduation Year"
                  value={viewingAssignment.graduationYear?.toString()}
                />
              </Section>

              {/* Address */}
              <Section title="Address">
                <DetailRow label="Address" value={viewingAssignment.address} />
                <DetailRow label="City" value={viewingAssignment.city} />
                <DetailRow label="State" value={viewingAssignment.state} />
                <DetailRow label="Country" value={viewingAssignment.country} />
                <DetailRow label="Pincode" value={viewingAssignment.pincode} />
              </Section>

              {/* Internship Preferences */}
              <Section title="Internship Preferences">
                <DetailRow label="Domain" value={viewingAssignment.domain} />
                <DetailRow
                  label="Preferred Start Date"
                  value={formatDateStr(viewingAssignment.preferredStartDate)}
                />
                <DetailRow
                  label="Preferred Duration"
                  value={viewingAssignment.preferredDuration}
                />
              </Section>

              {/* Emergency Contact */}
              <Section title="Emergency Contact">
                <DetailRow
                  label="Name"
                  value={viewingAssignment.emergencyContactName}
                />
                <DetailRow
                  label="Phone"
                  value={viewingAssignment.emergencyContactPhone}
                />
                <DetailRow
                  label="Relation"
                  value={viewingAssignment.emergencyContactRelation}
                />
              </Section>

              {/* Exam Status */}
              <Section title="Exam Status">
                <DetailRow
                  label="Score"
                  value={String(viewingAssignment.score ?? 0)}
                />
                <DetailRow
                  label="Status"
                  value={getStatusText(viewingAssignment.status)}
                />
                <DetailRow
                  label="Cheating"
                  value={viewingAssignment.cheating ? "Flagged" : "Clean"}
                />
                <DetailRow
                  label="Started At"
                  value={formatDateTimeStr(viewingAssignment.startedAt)}
                />
                <DetailRow
                  label="Submitted At"
                  value={formatDateTimeStr(viewingAssignment.submittedAt)}
                />
              </Section>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============ DELETE CONFIRMATION ============ */}
      <AlertDialog open={!!removingId} onOpenChange={() => setRemovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this student from the exam?
              This will delete all their progress and answers for this exam.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingId && handleRemove(removingId)}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Removing..." : "Remove Student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// =====================================================
// SMALL UI HELPERS
// =====================================================

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2">
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex flex-col text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white break-words">
        {value && value.trim() !== "" ? value : "—"}
      </span>
    </div>
  );
}