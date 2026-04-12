// components/dashboard/students/StudentsTable.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Search } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditStudentDialog } from "./EditStudentDialog";
import { DeleteStudentDialog } from "./DeleteStudentDialog"; 
import { toast } from "sonner";

type Student = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  dob: Date | null;
  createdAt: Date | null;
};

interface StudentsTableProps {
  initialStudents: Student[];
}

export function StudentsTable({ initialStudents }: StudentsTableProps) {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone?.includes(searchTerm)
  );

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No students added yet</h3>
        <p className="text-muted-foreground mt-2">
          Add your first student to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredStudents.length} of {students.length} students
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name || "—"}</TableCell>
                  <TableCell>{student.email || "—"}</TableCell>
                  <TableCell>{student.phone || "—"}</TableCell>
                  <TableCell>
                    {student.dob 
                      ? format(new Date(student.dob), "MMM dd, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {student.createdAt 
                      ? format(new Date(student.createdAt), "MMM dd, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeletingStudent(student)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditStudentDialog
        student={editingStudent}
        open={!!editingStudent}
        onOpenChange={(open) => !open && setEditingStudent(null)}
        onStudentUpdated={(updatedStudent) => {
          setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
          setEditingStudent(null);
        }}
      />

      <DeleteStudentDialog
        student={deletingStudent}
        open={!!deletingStudent}
        onOpenChange={(open) => !open && setDeletingStudent(null)}
        onStudentDeleted={(studentId) => {
          setStudents(students.filter(s => s.id !== studentId));
          setDeletingStudent(null);
        }}
      />
    </>
  );
}