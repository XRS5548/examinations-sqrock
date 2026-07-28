"use server";

import { db } from "@/db";
import { exams, students, examRegistrations, companies } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  dob: z.string().min(1, "Date of birth is required"),
  examId: z.coerce.number(),
});

export type PublicExam = {
  id: number;
  name: string | null;
  description: string | null;
  examDate: Date | null;
  durationMinutes: number | null;
  totalMarks: number | null;
  companyName: string | null;
};

export async function getAvailableExams(): Promise<PublicExam[]> {
  try {
    const result = await db
      .select({
        id: exams.id,
        name: exams.name,
        description: exams.description,
        examDate: exams.examDate,
        durationMinutes: exams.durationMinutes,
        totalMarks: exams.totalMarks,
        companyName: companies.name,
      })
      .from(exams)
      .leftJoin(companies, eq(exams.companyId, companies.id))
      .where(
        sql`${exams.isPublic} = true AND ${exams.isClosed} = false`
      )
      .orderBy(exams.examDate);

    return result;
  } catch (error) {
    console.error("Error fetching available exams:", error);
    return [];
  }
}

export async function registerForExam(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      dob: formData.get("dob") as string,
      examId: formData.get("examId") as string,
    };

    const validated = registrationSchema.parse(rawData);

    // Check if exam exists and is available for registration
    const examList = await db
      .select()
      .from(exams)
      .where(
        sql`${exams.id} = ${validated.examId} AND ${exams.isPublic} = true AND ${exams.isClosed} = false`
      )
      .limit(1);

    if (examList.length === 0) {
      return { 
        success: false, 
        error: "Exam not found or not available for registration" 
      };
    }

    const exam = examList[0];

    if (!exam.companyId) {
      return { 
        success: false, 
        error: "Exam is not associated with a company" 
      };
    }

    // Get company details
    const companyList = await db
      .select()
      .from(companies)
      .where(eq(companies.id, exam.companyId))
      .limit(1);

    if (companyList.length === 0) {
      return { 
        success: false, 
        error: "Company not found" 
      };
    }

    const company = companyList[0];

    // Check if student already exists
    let student = await db
      .select()
      .from(students)
      .where(
        and(
          eq(students.email, validated.email),
          eq(students.companyId, company.id)
        )
      )
      .limit(1);

    let studentId: number;
    let studentData = {
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      dob: validated.dob,
    };

    if (student.length > 0) {
      studentId = student[0].id;
      
      // Check if any details are missing and update them
      const existingStudent = student[0];
      let needsUpdate = false;
      
      // Prepare update object with only missing fields
      const updateData: {
        name?: string;
        email?: string;
        phone?: string;
        dob?: string;
      } = {};
      
      if (!existingStudent.name && validated.name) {
        updateData.name = validated.name;
        needsUpdate = true;
      }
      
      if (!existingStudent.email && validated.email) {
        updateData.email = validated.email;
        needsUpdate = true;
      }
      
      if (!existingStudent.phone && validated.phone) {
        updateData.phone = validated.phone;
        needsUpdate = true;
      }
      
      if (!existingStudent.dob && validated.dob) {
        updateData.dob = validated.dob;
        needsUpdate = true;
      }
      
      // Update student if any fields are missing
      if (needsUpdate) {
        await db
          .update(students)
          .set(updateData)
          .where(eq(students.id, studentId));
        
        // Refresh student data after update
        const [updatedStudent] = await db
          .select()
          .from(students)
          .where(eq(students.id, studentId))
          .limit(1);
        
        if (updatedStudent) {
          studentData = {
            name: updatedStudent.name || validated.name,
            email: updatedStudent.email || validated.email,
            phone: updatedStudent.phone || validated.phone,
            dob: updatedStudent.dob || validated.dob,
          };
        }
      } else {
        // Use existing student data
        studentData = {
          name: existingStudent.name || validated.name,
          email: existingStudent.email || validated.email,
          phone: existingStudent.phone || validated.phone,
          dob: existingStudent.dob || validated.dob,
        };
      }
    } else {
      // Create new student
      const [newStudent] = await db
        .insert(students)
        .values({
          companyId: company.id,
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
          dob: validated.dob,
        })
        .returning();

      if (!newStudent) {
        return { 
          success: false, 
          error: "Failed to create student profile" 
        };
      }
      studentId = newStudent.id;
    }

    // Check if already registered for this exam
    const existingRegistration = await db
      .select()
      .from(examRegistrations)
      .where(
        and(
          eq(examRegistrations.examId, validated.examId),
          eq(examRegistrations.studentId, studentId)
        )
      )
      .limit(1);

    if (existingRegistration.length > 0) {
      const reg = existingRegistration[0];
      return {
        success: true,
        registrationId: reg.id,
        rollNumber: reg.rollNumber,
        alreadyRegistered: true,
      };
    }

    // Generate unique roll number
    const year = new Date().getFullYear().toString();
    let rollNumber = `${studentId}${company.rollPrefix}${year}`;
    if (company.rollInfix) {
      rollNumber = `${studentId}${company.rollPrefix}${company.rollInfix}${year}`;
    }

    // Ensure roll number is unique
    let isUnique = false;
    let suffix = 0;
    let finalRollNumber = rollNumber;

    while (!isUnique) {
      const existing = await db
        .select()
        .from(examRegistrations)
        .where(eq(examRegistrations.rollNumber, finalRollNumber))
        .limit(1);

      if (existing.length === 0) {
        isUnique = true;
      } else {
        suffix++;
        finalRollNumber = `${rollNumber}${suffix}`;
      }
    }

    // Create registration
    const [registration] = await db
      .insert(examRegistrations)
      .values({
        examId: validated.examId,
        studentId: studentId,
        rollNumber: finalRollNumber,
        status: "not_started",
        cheating: false,
        score: 0,
      })
      .returning();

    if (!registration) {
      return { 
        success: false, 
        error: "Failed to create registration" 
      };
    }

    return {
      success: true,
      registrationId: registration.id,
      rollNumber: registration.rollNumber,
      alreadyRegistered: false,
    };
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        // error: error.er.map(e => e.message).join(", ") 
      };
    }
    
    return { 
      success: false, 
      error: "Registration failed. Please try again." 
    };
  }
}

export type RegistrationDetails = {
  id: number;
  rollNumber: string | null;
  examName: string | null;
  examDate: Date | null;
  durationMinutes: number | null;
  totalMarks: number | null;
  companyName: string | null;
  studentName: string | null;
  studentEmail: string | null;
  studentPhone: string | null;
  studentDob: string | null;
  status: string | null;
  createdAt: Date | null;
  syllabusPdf: string | null;
};

export async function getRegistrationDetails(registrationId: number): Promise<RegistrationDetails | null> {
  try {
    const result = await db
      .select({
        id: examRegistrations.id,
        rollNumber: examRegistrations.rollNumber,
        status: examRegistrations.status,
        createdAt: examRegistrations.startedAt,
        examName: exams.name,
        examDate: exams.examDate,
        durationMinutes: exams.durationMinutes,
        totalMarks: exams.totalMarks,
        companyName: companies.name,
        studentName: students.name,
        studentEmail: students.email,
        studentPhone: students.phone,
        studentDob: students.dob,
        syllabusPdf: exams.syllabusPdf,
      })
      .from(examRegistrations)
      .leftJoin(exams, eq(examRegistrations.examId, exams.id))
      .leftJoin(students, eq(examRegistrations.studentId, students.id))
      .leftJoin(companies, eq(exams.companyId, companies.id))
      .where(eq(examRegistrations.id, registrationId))
      .limit(1);

    if (result.length === 0) return null;
    return result[0];
  } catch (error) {
    console.error("Error fetching registration details:", error);
    return null;
  }
}