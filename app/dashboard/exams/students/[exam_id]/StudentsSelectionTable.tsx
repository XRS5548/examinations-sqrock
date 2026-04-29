// components/dashboard/exams/students/StudentsSelectionTable.tsx
"use client";

import { useState, useRef } from "react";
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
import { Search, Users, Upload, FileSpreadsheet } from "lucide-react";
import { assignStudentsToExam } from "@/actions/examStudents";
import { toast } from "sonner";
import * as XLSX from "xlsx";

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
  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const processFile = async (file: File) => {
    setFileUploading(true);
    try {
      const data = await readFile(file);
      const emails = extractEmailsFromFile(data, file.name);
      
      if (emails.length === 0) {
        toast.error("No valid emails found in the file. Please ensure there's an email column.");
        return;
      }

      // Find matching students based on email
      const matchedStudents = students.filter(student => 
        student.email && emails.includes(student.email.toLowerCase())
      );

      if (matchedStudents.length === 0) {
        toast.error(`No matching students found for the ${emails.length} email(s) in the file.`);
        return;
      }

      // Select matched students
      const newSelected = new Set(selectedStudents);
      matchedStudents.forEach(student => newSelected.add(student.id));
      setSelectedStudents(newSelected);
      setSelectAll(newSelected.size === filteredStudents.length && filteredStudents.length > 0);

      toast.success(`Selected ${matchedStudents.length} student(s) from file. Total selected: ${newSelected.size}`);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process file. Please check the format.");
    } finally {
      setFileUploading(false);
    }
  };

  const readFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (file.name.endsWith('.csv')) {
            // Parse CSV
            const text = data as string;
            const rows = text.split('\n').map(row => row.split(','));
            resolve(rows);
          } else {
            // Parse Excel
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            resolve(jsonData);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read file"));
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  type CsvRow = string[];
type ExcelRow = Record<string, string | undefined>;

const extractEmailsFromFile = (
  data: CsvRow[] | ExcelRow[],
  fileName: string
): string[] => {
  const emails = new Set<string>();

  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  if (fileName.endsWith(".csv")) {
    // CSV Handling
    const headers = (data[0] as CsvRow).map((cell) =>
      String(cell).toLowerCase()
    );

    const emailColumnIndex = headers.findIndex(
      (header) =>
        header.includes("email") ||
        header === "e-mail" ||
        header === "mail"
    );

    if (emailColumnIndex === -1) {
      toast.error("No email column found in CSV file");
      return [];
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i] as CsvRow;

      const email = row[emailColumnIndex]?.toLowerCase().trim();

      if (email && isValidEmail(email)) {
        emails.add(email);
      }
    }
  } else {
    // Excel Handling
    const excelData = data as ExcelRow[];
    const firstRow = excelData[0];

    const emailColumns: string[] = [];

    Object.keys(firstRow).forEach((key) => {
      const lowerKey = key.toLowerCase();

      if (
        lowerKey.includes("email") ||
        lowerKey === "e-mail" ||
        lowerKey === "mail"
      ) {
        emailColumns.push(key);
      }
    });

    if (!emailColumns.length) {
      toast.error(
        "No email column found in Excel file. Look for columns named Email, E-mail etc."
      );
      return [];
    }

    emailColumns.forEach((column) => {
      excelData.forEach((row) => {
        const value = row[column];

        if (typeof value === "string") {
          const email = value.trim().toLowerCase();

          if (isValidEmail(email)) {
            emails.add(email);
          }
        }
      });
    });
  }

  return [...emails];
};

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      toast.error("Please upload an Excel (.xlsx, .xls) or CSV (.csv) file");
      return;
    }
    
    processFile(file);
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={fileUploading}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {fileUploading ? "Processing..." : "Upload Excel/CSV"}
          </Button>
          
          <Button onClick={handleAssign} disabled={loading || selectedStudents.size === 0}>
            {loading ? "Assigning..." : `Assign Selected (${selectedStudents.size})`}
          </Button>
        </div>
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
      
      {selectedStudents.size > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedStudents.size} student(s) selected
        </div>
      )}
    </div>
  );
}