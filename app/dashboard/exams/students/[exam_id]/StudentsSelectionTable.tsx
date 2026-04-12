// components/dashboard/exams/students/StudentsSelectionTable.tsx
"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users } from "lucide-react";
import { assignStudentsToExam } from "@/actions/examStudents"; 
import { toast } from "sonner";

type Student = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  dob: Date | null;
  createdAt: Date | null;
};

interface StudentsSelectionTableProps {
  examId: number;
  students: Student[];
  companyPrefix: string;
  companyInfix: string | null;
}

export function StudentsSelectionTable({
  examId,
  students,
  companyPrefix,
  companyInfix,
}: StudentsSelectionTableProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents(new Set());
    } else {
      const allIds = new Set(filteredStudents.map(s => s.id));
      setSelectedStudents(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectStudent = (studentId: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
    setSelectAll(newSelected.size === filteredStudents.length && filteredStudents.length > 0);
  };

  const handleAssign = async () => {
    if (selectedStudents.size === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setLoading(true);
    try {
      const studentIds = Array.from(selectedStudents);
      const result = await assignStudentsToExam(studentIds, examId, companyPrefix, companyInfix);

      if (result.success) {
        toast.success(`Successfully assigned ${selectedStudents.size} student(s)`);
        setSelectedStudents(new Set());
        setSelectAll(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to assign students");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No students available</h3>
        <p className="text-muted-foreground mt-2">
          Add students to your company first
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAssign} disabled={loading || selectedStudents.size === 0}>
          {loading ? "Assigning..." : `Assign Selected (${selectedStudents.size})`}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectAll && filteredStudents.length > 0}
                  onCheckedChange={handleSelectAll}
                  disabled={filteredStudents.length === 0}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedStudents.has(student.id)}
                    onCheckedChange={() => handleSelectStudent(student.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{student.name || "—"}</TableCell>
                <TableCell>{student.email || "—"}</TableCell>
                <TableCell>{student.phone || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          No students found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}