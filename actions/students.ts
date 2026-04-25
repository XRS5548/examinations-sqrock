// actions/students.ts
"use server";

import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { format } from "date-fns";

const createStudentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
});

const updateStudentSchema = z.object({
  studentId: z.string(),
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
});

export async function createStudent(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found. Please create a company first." };
    }

    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      dob: formData.get("dob") as string,
    };

    const validated = createStudentSchema.parse(rawData);

    // Check for duplicate email within the same company
    if (validated.email) {
      const existingStudent = await db.select()
        .from(students)
        .where(
          and(
            eq(students.email, validated.email),
            eq(students.companyId, company.id)
          )
        )
        .limit(1);

      if (existingStudent.length > 0) {
        return { success: false, error: "Student with this email already exists in your company" };
      }
    }

    // Insert student - convert dob string to Date or keep as null
    const insertData: any = {
      companyId: company.id,
      name: validated.name,
      email: validated.email || null,
      phone: validated.phone || null,
      createdAt: new Date(),
    };

    if (validated.dob) {
      insertData.dob = validated.dob; // Keep as string, database will handle
    } else {
      insertData.dob = null;
    }

    const [newStudent] = await db.insert(students).values(insertData).returning();

    if (!newStudent) {
      return { success: false, error: "Failed to create student" };
    }

    revalidatePath("/dashboard/students");
    
    return { success: true, student: newStudent };
  } catch (error) {
    console.error("Create student error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to create student" };
  }
}

export async function updateStudent(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    const rawData = {
      studentId: formData.get("studentId") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      dob: formData.get("dob") as string,
    };

    const validated = updateStudentSchema.parse(rawData);
    const studentId = parseInt(validated.studentId);

    // Check if student exists and belongs to company
    const existingStudent = await db.select()
      .from(students)
      .where(
        and(
          eq(students.id, studentId),
          eq(students.companyId, company.id)
        )
      )
      .limit(1);

    if (existingStudent.length === 0) {
      return { success: false, error: "Student not found" };
    }

    // Check for duplicate email within the same company (excluding current student)
    if (validated.email) {
      const duplicateStudent = await db.select()
        .from(students)
        .where(
          and(
            eq(students.email, validated.email),
            eq(students.companyId, company.id),
            eq(students.id, studentId)
          )
        )
        .limit(1);

      if (duplicateStudent.length > 0) {
        return { success: false, error: "Student with this email already exists in your company" };
      }
    }

    // Update student
    const updateData: any = {
      name: validated.name,
      email: validated.email || null,
      phone: validated.phone || null,
      dob: validated.dob || null,
    };

    const [updatedStudent] = await db.update(students)
      .set(updateData)
      .where(eq(students.id, studentId))
      .returning();

    if (!updatedStudent) {
      return { success: false, error: "Failed to update student" };
    }

    revalidatePath("/dashboard/students");
    
    return { success: true, student: updatedStudent };
  } catch (error) {
    console.error("Update student error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to update student" };
  }
}

export async function deleteStudent(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    // Check if student exists and belongs to company
    const existingStudent = await db.select()
      .from(students)
      .where(
        and(
          eq(students.id, id),
          eq(students.companyId, company.id)
        )
      )
      .limit(1);

    if (existingStudent.length === 0) {
      return { success: false, error: "Student not found" };
    }

    // Delete student (exam registrations will cascade due to ON DELETE CASCADE)
    await db.delete(students).where(eq(students.id, id));

    revalidatePath("/dashboard/students");
    
    return { success: true };
  } catch (error) {
    console.error("Delete student error:", error);
    return { success: false, error: "Failed to delete student" };
  }
}

export async function getStudentsByCompany() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const company = await getUserCompany();
    if (!company) {
      return [];
    }

    const studentsList = await db.select()
      .from(students)
      .where(eq(students.companyId, company.id))
      .orderBy(students.createdAt);

    return studentsList;
  } catch (error) {
    console.error("Get students error:", error);
    return [];
  }
}

export async function bulkImportStudents(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let studentsData: any[] = [];
    
    // Parse based on file type
    if (file.name.endsWith('.csv')) {
      const content = buffer.toString('utf-8');
      studentsData = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else if (file.name.endsWith('.xlsx')) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      studentsData = XLSX.utils.sheet_to_json(worksheet);
    } else {
      return { success: false, error: "Unsupported file format" };
    }

    if (studentsData.length === 0) {
      return { success: false, error: "No data found in file" };
    }

    if (studentsData.length > 1000) {
      return { success: false, error: "Maximum 1000 students per import" };
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const row of studentsData) {
      try {
        const name = row.Name || row.name || row.NAME;
        const email = row.Email || row.email || row.EMAIL || "";
        const phone = row.Phone || row.phone || row.PHONE || "";
        const dob = row["Date of Birth"] || row.dob || row.DOB || "";
        
        if (!name) {
          errorCount++;
          errors.push(`Missing name in row ${studentsData.indexOf(row) + 2}`);
          continue;
        }

        // Check for duplicate email in company
        if (email) {
          const existingStudent = await db.select()
            .from(students)
            .where(
              and(
                eq(students.email, email),
                eq(students.companyId, company.id)
              )
            )
            .limit(1);

          if (existingStudent.length > 0) {
            errorCount++;
            errors.push(`Email "${email}" already exists (row ${studentsData.indexOf(row) + 2})`);
            continue;
          }
        }

        const insertData: any = {
          companyId: company.id,
          name: name,
          email: email || null,
          phone: phone || null,
          createdAt: new Date(),
        };

        if (dob) {
          insertData.dob = dob;
        } else {
          insertData.dob = null;
        }

        await db.insert(students).values(insertData);
        
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Error in row ${studentsData.indexOf(row) + 2}: ${error}`);
      }
    }

    revalidatePath("/dashboard/students");

    if (successCount > 0) {
      return { 
        success: true, 
        count: successCount,
        message: `Imported ${successCount} students successfully. ${errorCount} failed.`,
        errors: errors.slice(0, 10)
      };
    } else {
      return { 
        success: false, 
        error: "No students were imported. Please check your file format.",
        errors 
      };
    }
  } catch (error) {
    console.error("Bulk import error:", error);
    return { success: false, error: "Failed to import students" };
  }
}

export async function bulkDeleteStudents(studentIds: number[]) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    if (studentIds.length === 0) {
      return { success: false, error: "No students selected" };
    }

    // Verify all students belong to the company
    const studentsList = await db
      .select()
      .from(students)
      .where(
        and(
          inArray(students.id, studentIds),
          eq(students.companyId, company.id)
        )
      );

    if (studentsList.length !== studentIds.length) {
      return { success: false, error: "Some students do not belong to your company" };
    }

    // Delete all selected students (cascade will handle registrations)
    await db.delete(students).where(inArray(students.id, studentIds));

    revalidatePath("/dashboard/students");
    
    return { success: true, count: studentIds.length };
  } catch (error) {
    console.error("Bulk delete students error:", error);
    return { success: false, error: "Failed to delete students" };
  }
}

export async function exportStudentsToCSV() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    const studentsList = await db
      .select()
      .from(students)
      .where(eq(students.companyId, company.id))
      .orderBy(students.createdAt);

    // Prepare CSV data
    const headers = [
      "S.No",
      "Name",
      "Email",
      "Phone",
      "Date of Birth",
      "Created At"
    ];

    const rows = studentsList.map((student, index) => [
      index + 1,
      student.name || "",
      student.email || "",
      student.phone || "",
      student.dob ? format(new Date(student.dob), "yyyy-MM-dd") : "",
      student.createdAt ? format(new Date(student.createdAt), "yyyy-MM-dd HH:mm:ss") : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => 
          typeof cell === "string" && (cell.includes(",") || cell.includes('"') || cell.includes("\n"))
            ? `"${cell.replace(/"/g, '""').replace(/\n/g, ' ')}"`
            : cell
        ).join(",")
      )
    ].join("\n");

    return { success: true, data: "\uFEFF" + csvContent };
  } catch (error) {
    console.error("Export students error:", error);
    return { success: false, error: "Failed to export students" };
  }
}