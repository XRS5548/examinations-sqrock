// components/dashboard/home/RecentExams.tsx
"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Calendar } from "lucide-react";

type Exam = {
  id: number;
  name: string | null;
  examDate: Date | null;
  isLive: boolean;
  createdAt: Date | null;
};

interface RecentExamsProps {
  exams: Exam[];
}

export function RecentExams({ exams }: RecentExamsProps) {
  const router = useRouter();

  if (exams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Exams</CardTitle>
          <CardDescription>Your recently created exams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No exams created yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard/exams")}
            >
              Create Your First Exam
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Exams</CardTitle>
        <CardDescription>Your recently created exams</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{exam.name || "Untitled"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {exam.examDate
                        ? format(new Date(exam.examDate), "MMM dd, yyyy")
                        : "Not set"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={exam.isLive ? "default" : "secondary"}>
                    {exam.isLive ? "Live" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/exams/questions/${exam.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {exams.length === 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/exams")}
            >
              View All Exams →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}