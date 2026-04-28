import { Suspense } from "react";
import { db } from "@/db";
import { exams, examRegistrations } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getUserCompany } from "@/actions/company";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, Users, Calendar, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ResultsOverviewPage() {
  const company = await getUserCompany();
  
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Please create a company first</p>
      </div>
    );
  }

  // Fetch all exams with submission counts, ordered by resultAnnounced (announced first) and then by most recent announcement
  const companyExams = await db
    .select({
      id: exams.id,
      name: exams.name,
      description: exams.description,
      totalMarks: exams.totalMarks,
      durationMinutes: exams.durationMinutes,
      resultAnnounced: exams.resultAnnounced,
      examDate: exams.examDate,
      createdAt: exams.createdAt,
      isLive: exams.isLive,
      isClosed: exams.isClosed,
      submissionCount: sql<number>`count(${examRegistrations.id})`.mapWith(Number),
    })
    .from(exams)
    .leftJoin(examRegistrations, eq(exams.id, examRegistrations.examId))
    .where(eq(exams.companyId, company.id))
    .groupBy(exams.id)
    .orderBy(
      desc(exams.resultAnnounced), // Announced exams first (true = 1, false = 0)
      desc(exams.resultAnnounced ? exams.examDate : exams.createdAt) // For announced exams, show most recent announcement first
    );

  if (companyExams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No exams found. Create an exam first to see results.</p>
      </div>
    );
  }

  // Calculate stats
  const announcedExamsCount = companyExams.filter(exam => exam.resultAnnounced).length;
  const totalSubmissions = companyExams.reduce((sum, exam) => sum + (exam.submissionCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage student results across all exams
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{companyExams.length}</div>
            <div className="text-xs text-muted-foreground">Total Exams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{announcedExamsCount}</div>
            <div className="text-xs text-muted-foreground">Results Announced</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <div className="text-xs text-muted-foreground">Total Submissions</div>
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Name</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Total Marks</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companyExams.map((exam) => (
              <TableRow key={exam.id} className={exam.resultAnnounced ? "bg-green-50/50 dark:bg-green-950/20" : ""}>
                <TableCell className="font-medium">
                  <div>
                    {exam.name}
                    {exam.isLive && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                        Live
                      </Badge>
                    )}
                  </div>
                  {exam.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {exam.description.length > 50 ? `${exam.description.substring(0, 50)}...` : exam.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{exam.durationMinutes} mins</span>
                    </div>
                    {exam.examDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{exam.totalMarks}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{exam.submissionCount || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={exam.isClosed ? "secondary" : "outline"}>
                    {exam.isClosed ? "Closed" : "Open"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {exam.resultAnnounced ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Announced
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/results/${exam.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-50 dark:bg-green-950 rounded border border-green-200"></div>
          <span>Results Announced</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Live
          </Badge>
          <span>Exam is currently live</span>
        </div>
      </div>
    </div>
  );
}