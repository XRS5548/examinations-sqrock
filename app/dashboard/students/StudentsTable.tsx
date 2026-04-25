// components/dashboard/students/StudentsTable.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Search, Trash2, CheckSquare, Square, Download } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EditStudentDialog } from "./EditStudentDialog";
import { DeleteStudentDialog } from "./DeleteStudentDialog"; 
import { bulkDeleteStudents, exportStudentsToCSV } from "@/actions/students";
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
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone?.includes(searchTerm)
  );

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleSelectStudent = (studentId: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const studentIds = Array.from(selectedStudents);
      const result = await bulkDeleteStudents(studentIds);
      
      if (result.success) {
        toast.success(`Successfully deleted ${result.count} students`);
        setStudents(students.filter(s => !selectedStudents.has(s.id)));
        setSelectedStudents(new Set());
        setBulkDeleteDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to delete students");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const result = await exportStudentsToCSV();
      if (result.success) {
        // Download the file
        const blob = new Blob([result.data!], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `students_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Students exported successfully");
      } else {
        toast.error(result.error || "Failed to export students");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const isAllSelected = filteredStudents.length > 0 && selectedStudents.size === filteredStudents.length;
  const isSomeSelected = selectedStudents.size > 0;

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
        {/* Top Bar with Search, Bulk Actions, and Export */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1">
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
          <div className="flex gap-2">
            {isSomeSelected && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedStudents.size})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
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
                <TableRow 
                  key={student.id}
                  className={selectedStudents.has(student.id) ? "bg-muted/50" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.has(student.id)}
                      onCheckedChange={() => handleSelectStudent(student.id)}
                      aria-label={`Select ${student.name}`}
                    />
                  </TableCell>
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

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Multiple Students</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedStudents.size} selected student(s)? 
                This action cannot be undone. All exam registrations and answers for these students will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : `Delete ${selectedStudents.size} Student(s)`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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