// actions/public-registration.ts
"use server";

import { db } from "@/db";
import { exams, students, examRegistrations, companies } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { INTERNSHIP_DOMAINS } from "@/lib/internship";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),

  domain: z.enum(INTERNSHIP_DOMAINS, {
    error: "Select a valid domain",
  }),

  // Education Details
  universityName: z.string().min(1, "University name is required"),
  collegeName: z.string().min(1, "College name is required"),
  course: z.string().min(1, "Course is required"),
  branch: z.string().min(1, "Branch is required"),
  semester: z.string().min(1, "Semester is required"),
  enrollmentNumber: z.string().min(1, "Enrollment number is required"),
  graduationYear: z.string().min(1, "Graduation year is required"),

  // Address Details
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),

  // Emergency Contact
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
  emergencyContactRelation: z.string().min(1, "Emergency contact relation is required"),

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
        and(
          eq(exams.isPublic, true),
          eq(exams.isClosed, false),
          isNotNull(exams.internshipStartDate),
          isNotNull(exams.internshipEndDate),
          isNotNull(exams.internshipDuration)
        )
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
      gender: formData.get("gender") as string,

      domain: formData.get("domain") as string,

      // Education Details
      universityName: formData.get("universityName") as string,
      collegeName: formData.get("collegeName") as string,
      course: formData.get("course") as string,
      branch: formData.get("branch") as string,
      semester: formData.get("semester") as string,
      enrollmentNumber: formData.get("enrollmentNumber") as string,
      graduationYear: formData.get("graduationYear") as string,

      // Address Details
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      country: formData.get("country") as string,
      pincode: formData.get("pincode") as string,

      // Emergency Contact
      emergencyContactName: formData.get("emergencyContactName") as string,
      emergencyContactPhone: formData.get("emergencyContactPhone") as string,
      emergencyContactRelation: formData.get("emergencyContactRelation") as string,

      examId: formData.get("examId") as string,
    };

    const validated = registrationSchema.parse(rawData);

    // Check if exam exists and is available for registration
    const examList = await db
      .select()
      .from(exams)
      .where(
        and(
          eq(exams.id, validated.examId),
          eq(exams.isPublic, true),
          eq(exams.isClosed, false),
          isNotNull(exams.internshipStartDate),
          isNotNull(exams.internshipEndDate),
          isNotNull(exams.internshipDuration)
        )
      )
      .limit(1);

    if (examList.length === 0) {
      return {
        success: false,
        error: "Exam not found or not available for registration",
      };
    }

    const exam = examList[0];

    if (!exam.companyId) {
      return {
        success: false,
        error: "Exam is not associated with a company",
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
        error: "Company not found",
      };
    }

    const company = companyList[0];

    // Check if student already exists
    const student = await db
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

    if (student.length > 0) {
      studentId = student[0].id;

      // Update student details if missing
      const existingStudent = student[0];
      const updateData: Partial<typeof students.$inferInsert> = {};
      let needsUpdate = false;

      if (!existingStudent.name && validated.name) {
        updateData.name = validated.name;
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

      if (needsUpdate) {
        await db
          .update(students)
          .set(updateData)
          .where(eq(students.id, studentId));
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
          error: "Failed to create student profile",
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
        domain: reg.domain,
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

    // Create registration with ALL details
    const [registration] = await db
      .insert(examRegistrations)
      .values({
        examId: validated.examId,
        studentId: studentId,
        rollNumber: finalRollNumber,
        status: "not_started",
        cheating: false,
        score: 0,

        // Domain
        domain: validated.domain,

        // Personal Details
        gender: validated.gender || null,

        // Education Details
        universityName: validated.universityName,
        collegeName: validated.collegeName,
        course: validated.course,
        branch: validated.branch,
        semester: validated.semester,
        enrollmentNumber: validated.enrollmentNumber,
        graduationYear: validated.graduationYear
          ? parseInt(validated.graduationYear)
          : null,

        // Address Details
        address: validated.address,
        city: validated.city,
        state: validated.state,
        country: validated.country || "India",
        pincode: validated.pincode,

        // Emergency Contact
        emergencyContactName: validated.emergencyContactName,
        emergencyContactPhone: validated.emergencyContactPhone,
        emergencyContactRelation: validated.emergencyContactRelation,
      })
      .returning();

    if (!registration) {
      return {
        success: false,
        error: "Failed to create registration",
      };
    }

    return {
      success: true,
      registrationId: registration.id,
      rollNumber: registration.rollNumber,
      domain: registration.domain,
      alreadyRegistered: false,
    };
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: "Registration failed. Please try again.",
    };
  }
}

export type RegistrationDetails = {
  id: number;
  rollNumber: string | null;
  domain: string | null;

  // Exam Details
  examName: string | null;
  examDate: Date | null;
  durationMinutes: number | null;
  totalMarks: number | null;
  companyName: string | null;
  syllabusPdf: string | null;

  // Student Details
  studentName: string | null;
  studentEmail: string | null;
  studentPhone: string | null;
  studentDob: string | null;

  // NEW: Education Details
  universityName: string | null;
  collegeName: string | null;
  course: string | null;
  branch: string | null;
  semester: string | null;
  enrollmentNumber: string | null;
  graduationYear: number | null;

  // NEW: Address Details
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;

  // NEW: Personal Details
  gender: string | null;

  // NEW: Emergency Contact
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;

  status: string | null;
  createdAt: Date | null;
};

export async function getRegistrationDetails(
  registrationId: number
): Promise<RegistrationDetails | null> {
  try {
    const result = await db
      .select({
        id: examRegistrations.id,
        rollNumber: examRegistrations.rollNumber,
        domain: examRegistrations.domain,
        status: examRegistrations.status,
        createdAt: examRegistrations.startedAt,

        // Exam Details
        examName: exams.name,
        examDate: exams.examDate,
        durationMinutes: exams.durationMinutes,
        totalMarks: exams.totalMarks,
        syllabusPdf: exams.syllabusPdf,

        // Student Details
        studentName: students.name,
        studentEmail: students.email,
        studentPhone: students.phone,
        studentDob: students.dob,

        // NEW: Education Details
        universityName: examRegistrations.universityName,
        collegeName: examRegistrations.collegeName,
        course: examRegistrations.course,
        branch: examRegistrations.branch,
        semester: examRegistrations.semester,
        enrollmentNumber: examRegistrations.enrollmentNumber,
        graduationYear: examRegistrations.graduationYear,

        // NEW: Address Details
        address: examRegistrations.address,
        city: examRegistrations.city,
        state: examRegistrations.state,
        country: examRegistrations.country,
        pincode: examRegistrations.pincode,

        // NEW: Personal Details
        gender: examRegistrations.gender,

        // NEW: Emergency Contact
        emergencyContactName: examRegistrations.emergencyContactName,
        emergencyContactPhone: examRegistrations.emergencyContactPhone,
        emergencyContactRelation: examRegistrations.emergencyContactRelation,

        // Company Details
        companyName: companies.name,
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