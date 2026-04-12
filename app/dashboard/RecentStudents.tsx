// components/dashboard/home/RecentStudents.tsx
"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Mail, Calendar } from "lucide-react";

type Student = {
  id: number;
  name: string | null;
  email: string | null;
  createdAt: Date | null;
};

interface RecentStudentsProps {
  students: Student[];
}

export function RecentStudents({ students }: RecentStudentsProps) {
  const router = useRouter();

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Students</CardTitle>
          <CardDescription>Your recently added students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No students added yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard/students")}
            >
              Add Your First Student
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Students</CardTitle>
        <CardDescription>Your recently added students</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name || "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{student.email || "—"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {student.createdAt
                        ? format(new Date(student.createdAt), "MMM dd, yyyy")
                        : "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/students`)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {students.length === 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/students")}
            >
              View All Students →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}