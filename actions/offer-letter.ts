// actions/offer-letter.ts
"use server";

import { offerLetters } from "@/db/recoards";
import { exams, examRegistrations, students } from "@/db/schema";
import { eq, and, inArray, or } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";
import {
  getDesignation,
  getDepartment,
} from "./offer-letter-helpers";

import { db } from "@/db";
import { studentDb } from "@/db/student-db";

// =====================================================
// TYPES
// =====================================================

export type OfferLetterResponse = {
  id: number;
  examid: string;
  offerLetterId: string;
  employeeId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  designation: string;
  department: string | null;
  internshipType: string | null;
  startDate: string;
  endDate: string | null;
  duration: string | null;
  stipend: string | null;
  workMode: string | null;
  issueDate: string;
  workHours: string | null;
  weeklyHours: number | null;
  shiftStartTime: string | null;
  shiftEndTime: string | null;
  breakDuration: string | null;
  reportingManager: string | null;
  reportingManagerDesignation: string | null;
  reportingManagerEmail: string | null;
  universityName: string | null;
  course: string | null;
  branch: string | null;
  semester: string | null;
  minimumAttendance: number | null;
  allowedLeaves: number | null;
  noticePeriod: string | null;
  hrName: string | null;
  hrDesignation: string | null;
  hrEmail: string | null;
  hrPhone: string | null;
  authorizedPersonName: string | null;
  authorizedPersonDesignation: string | null;
  authorizedSignature: string | null;
  companyStamp: string | null;
  responsibilities: string[] | null;
  learningObjectives: string[] | null;
  technologies: string[] | null;
  termsAndConditions: string[] | null;
  companyAssets: string[] | null;
  confidentialityClause: string | null;
  intellectualPropertyClause: string | null;
  terminationPolicy: string | null;
  codeOfConduct: string | null;
  performanceReview: string | null;
  completionCriteria: string | null;
  certificateEligibility: string | null;
  leavePolicy: string | null;
};

// =====================================================
// HELPER - Drizzle row → Plain JSON object
// =====================================================

function serializeOfferLetter(
  row: typeof offerLetters.$inferSelect
): OfferLetterResponse {
  return {
    id: row.id,
    examid: row.examid,
    offerLetterId: row.offerLetterId,
    employeeId: row.employeeId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    designation: row.designation,
    department: row.department,
    internshipType: row.internshipType,
    startDate: String(row.startDate),
    endDate: row.endDate ? String(row.endDate) : null,
    duration: row.duration,
    stipend: row.stipend,
    workMode: row.workMode,
    issueDate: String(row.issueDate),
    workHours: row.workHours,
    weeklyHours: row.weeklyHours,
    shiftStartTime: row.shiftStartTime,
    shiftEndTime: row.shiftEndTime,
    breakDuration: row.breakDuration,
    reportingManager: row.reportingManager,
    reportingManagerDesignation: row.reportingManagerDesignation,
    reportingManagerEmail: row.reportingManagerEmail,
    universityName: row.universityName,
    course: row.course,
    branch: row.branch,
    semester: row.semester,
    minimumAttendance: row.minimumAttendance,
    allowedLeaves: row.allowedLeaves,
    noticePeriod: row.noticePeriod,
    hrName: row.hrName,
    hrDesignation: row.hrDesignation,
    hrEmail: row.hrEmail,
    hrPhone: row.hrPhone,
    authorizedPersonName: row.authorizedPersonName,
    authorizedPersonDesignation: row.authorizedPersonDesignation,
    authorizedSignature: row.authorizedSignature,
    companyStamp: row.companyStamp,
    responsibilities: (row.responsibilities as string[]) || null,
    learningObjectives: (row.learningObjectives as string[]) || null,
    technologies: (row.technologies as string[]) || null,
    termsAndConditions: (row.termsAndConditions as string[]) || null,
    companyAssets: (row.companyAssets as string[]) || null,
    confidentialityClause: row.confidentialityClause,
    intellectualPropertyClause: row.intellectualPropertyClause,
    terminationPolicy: row.terminationPolicy,
    codeOfConduct: row.codeOfConduct,
    performanceReview: row.performanceReview,
    completionCriteria: row.completionCriteria,
    certificateEligibility: row.certificateEligibility,
    leavePolicy: row.leavePolicy,
  };
}

// =====================================================
// GET OR CREATE OFFER LETTER
// =====================================================

export async function getOrCreateOfferLetter(
  registrationId: number
): Promise<OfferLetterResponse> {
  const sourceList = await db
    .select({
      registrationId: examRegistrations.id,
      examId: exams.id,
      companyId: exams.companyId,
      rollNumber: examRegistrations.rollNumber,
      domain: examRegistrations.domain,
      gender: examRegistrations.gender,
      status: examRegistrations.status,
      score: examRegistrations.score,
      cheating: examRegistrations.cheating,
      universityName: examRegistrations.universityName,
      collegeName: examRegistrations.collegeName,
      course: examRegistrations.course,
      branch: examRegistrations.branch,
      semester: examRegistrations.semester,
      enrollmentNumber: examRegistrations.enrollmentNumber,
      graduationYear: examRegistrations.graduationYear,
      address: examRegistrations.address,
      city: examRegistrations.city,
      state: examRegistrations.state,
      country: examRegistrations.country,
      pincode: examRegistrations.pincode,
      emergencyContactName: examRegistrations.emergencyContactName,
      emergencyContactPhone: examRegistrations.emergencyContactPhone,
      emergencyContactRelation: examRegistrations.emergencyContactRelation,
      studentName: students.name,
      studentEmail: students.email,
      phone: students.phone,
      dob: students.dob,
      examName: exams.name,
      resultAnnounced: exams.resultAnnounced,
      passingScore: exams.passingScore,
      internshipStartDate: exams.internshipStartDate,
      internshipEndDate: exams.internshipEndDate,
      internshipDuration: exams.internshipDuration,
    })
    .from(examRegistrations)
    .innerJoin(exams, eq(examRegistrations.examId, exams.id))
    .innerJoin(students, eq(examRegistrations.studentId, students.id))
    .where(eq(examRegistrations.id, registrationId))
    .limit(1);

  if (sourceList.length === 0) {
    throw new Error("Registration not found");
  }

  const source = sourceList[0];

  if (!source.rollNumber || !source.studentName || !source.studentEmail) {
    throw new Error("Student registration data is incomplete");
  }

  const user = await getCurrentUser();
  const company = user ? await getUserCompany() : null;
  if (!company || source.companyId !== company.id) {
    throw new Error("Unauthorized");
  }

  if (!source.resultAnnounced) {
    throw new Error("Results are not announced yet");
  }

  if (source.status !== "completed") {
    throw new Error("Exam is not completed");
  }

  if (source.cheating) {
    throw new Error("Offer letters cannot be generated for flagged registrations");
  }

  if ((source.score ?? 0) < (source.passingScore ?? 60)) {
    throw new Error("Student did not achieve the passing score");
  }

  if (
    !source.internshipStartDate ||
    !source.internshipEndDate ||
    !source.internshipDuration
  ) {
    throw new Error("Exam internship schedule is not configured");
  }

  const now = new Date();
  const offerLetterId = `SQ-INT-${now.getFullYear()}-${String(
    registrationId
  ).padStart(5, "0")}`;

  const existing = await studentDb
    .select()
    .from(offerLetters)
    .where(
      or(
        eq(offerLetters.offerLetterId, offerLetterId),
        eq(offerLetters.employeeId, source.rollNumber)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const existingOffer = existing[0];
    if (existingOffer.examid !== String(source.examId)) {
      const [updatedOffer] = await studentDb
        .update(offerLetters)
        .set({ examid: String(source.examId) })
        .where(eq(offerLetters.id, existingOffer.id))
        .returning();
      return serializeOfferLetter(updatedOffer || existingOffer);
    }
    return serializeOfferLetter(existingOffer);
  }

  // =====================================================
  // ✅ Pass domain to get designation & department
  // Priority: domain > examName
  // =====================================================

  const designation = getDesignation(
    source.examName || "Internship",
    source.domain
  );

  const department = getDepartment(
    source.examName || "Internship",
    source.domain
  );

  const [newOffer] = await studentDb
    .insert(offerLetters)
    .values({
      examid: String(source.examId),
      offerLetterId,
      employeeId: source.rollNumber,
      name: source.studentName,
      email: source.studentEmail,
      phone: source.phone || null,

      designation: designation,
      department: department,
      internshipType: "Unpaid Remote Internship",
      startDate: source.internshipStartDate,
      endDate: source.internshipEndDate,
      duration: source.internshipDuration,
      issueDate: now.toISOString().split("T")[0],
      workMode: "remote",
      stipend: "Unpaid",

      workHours: "8 hours per day",
      weeklyHours: 40,
      shiftStartTime: "10:00 AM",
      shiftEndTime: "6:00 PM",
      breakDuration: "45 Minutes",

      reportingManager: "Rohit Verma",
      reportingManagerDesignation: "Director",
      reportingManagerEmail: "support@sqrock.cloud",

      // USE ACTUAL STUDENT DATA
      universityName: source.universityName || "",
      course: source.course || "",
      branch: source.branch || "",
      semester: source.semester || "",

      minimumAttendance: 80,
      allowedLeaves: 3,
      noticePeriod: "7 Days",

      hrName: "SANIYA KHAN",
      hrDesignation: "Co-Founder",
      hrEmail: "support@sqrock.cloud",
      hrPhone: "+91 8619819400",

      authorizedPersonName: "Rohit Verma",
      authorizedPersonDesignation: "Director",
      authorizedSignature: "/rohit.png",
      companyStamp: "/stamp.png",

      // ✅ DYNAMIC CONTENT BASED ON DOMAIN
      responsibilities: getResponsibilities(designation),
      learningObjectives: getLearningObjectives(designation),
      technologies: getTechnologies(designation),

      termsAndConditions: [
        "This is an unpaid internship and does not include any stipend or salary.",
        "The internship will be conducted remotely.",
        "The internship does not automatically guarantee permanent employment.",
        "The intern must follow all company policies and professional standards.",
        "The intern must complete assigned tasks and projects within the required timelines.",
        "Unauthorized sharing of company credentials or confidential information is strictly prohibited.",
        "Company resources must only be used for authorized internship-related work.",
        "The intern must maintain professional communication and conduct throughout the internship.",
        "The company reserves the right to modify or terminate the internship in accordance with applicable company policies.",
      ],

      companyAssets: [
        "Company email account, where applicable",
        "Project repository access",
        "Required internal development tools and resources",
      ],

      confidentialityClause:
        "The intern shall maintain strict confidentiality of company, client, project, technical and business information accessed during the internship. Such information must not be disclosed to any unauthorized person during or after the internship.",

      intellectualPropertyClause:
        "All source code, designs, documents, reports and other work products created during the internship as part of assigned company work shall remain the intellectual property of the company unless otherwise agreed in writing.",

      terminationPolicy:
        "The company may terminate the internship in case of misconduct, policy violations, confidentiality breaches, unauthorized absence, failure to complete assigned work or unsatisfactory performance.",

      codeOfConduct:
        "The intern is expected to maintain professional conduct, communicate respectfully with team members and comply with all applicable company policies and instructions.",

      performanceReview:
        "Performance will be evaluated based on attendance, task completion, quality of work, technical progress, communication, teamwork and professional conduct.",

      completionCriteria:
        "The intern must maintain the required attendance, complete assigned projects and tasks, participate in required activities and fulfill the internship requirements within the specified duration.",

      certificateEligibility:
        "An internship completion certificate may be issued after successful completion of the internship, fulfillment of attendance requirements and submission of all required work.",

      leavePolicy:
        "Leaves must be approved by the reporting manager in advance except in emergencies. The intern is expected to maintain the minimum required attendance throughout the internship.",
    })
    .returning();

  return serializeOfferLetter(newOffer);
}

export async function getCompanyOfferLetters(examId?: string): Promise<OfferLetterResponse[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const company = await getUserCompany();
    if (!company) return [];

    const companyExams = await db.select({ id: exams.id })
      .from(exams)
      .where(eq(exams.companyId, company.id));

    const examIds = companyExams.map((exam) => String(exam.id));
    if (examIds.length === 0) return [];

    const registrations = await db.select({
      examId: exams.id,
      rollNumber: examRegistrations.rollNumber,
    })
      .from(examRegistrations)
      .innerJoin(exams, eq(examRegistrations.examId, exams.id))
      .where(eq(exams.companyId, company.id));

    const registrationMap = new Map(
      registrations.flatMap((registration) =>
        registration.rollNumber
          ? [[registration.rollNumber, String(registration.examId)] as const]
          : []
      )
    );
    const rollNumbers = [...registrationMap.keys()];
    if (rollNumbers.length === 0) return [];

    const letters = await studentDb.select()
      .from(offerLetters)
      .where(inArray(offerLetters.employeeId, rollNumbers))
      .orderBy(offerLetters.createdAt);

    const normalizedLetters: (typeof offerLetters.$inferSelect)[] = [];
    for (const letter of letters) {
      const actualExamId = registrationMap.get(letter.employeeId || "");

      if (!actualExamId || (examId && actualExamId !== examId)) {
        continue;
      }

      if (letter.examid === actualExamId) {
        normalizedLetters.push(letter);
        continue;
      }

      const [updatedLetter] = await studentDb
        .update(offerLetters)
        .set({ examid: actualExamId })
        .where(eq(offerLetters.id, letter.id))
        .returning();
      normalizedLetters.push(updatedLetter || letter);
    }

    return normalizedLetters.map(serializeOfferLetter);
  } catch (error) {
    console.error("Get company offer letters error:", error);
    return [];
  }
}

// =====================================================
// GET STUDENTS ELIGIBLE FOR OFFER LETTER
// =====================================================

export async function getStudentsForOfferLetter(examId: number): Promise<{
  id: number;
  name: string;
  email: string;
  rollNumber: string;
  score: number;
  examName: string;
  domain: string | null;
  universityName: string | null;
  collegeName: string | null;
  course: string | null;
  branch: string | null;
  semester: string | null;
  hasOfferLetter: boolean;
}[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const company = await getUserCompany();
    if (!company) return [];

    // Verify exam belongs to company
    const examList = await db.select()
      .from(exams)
      .where(and(eq(exams.id, examId), eq(exams.companyId, company.id)))
      .limit(1);

    if (examList.length === 0) return [];

    const exam = examList[0];

    // Get all registrations for this exam with student details
    const registrations = await db.select({
      id: examRegistrations.id,
      rollNumber: examRegistrations.rollNumber,
      score: examRegistrations.score,
      status: examRegistrations.status,
      cheating: examRegistrations.cheating,
      domain: examRegistrations.domain,
      universityName: examRegistrations.universityName,
      collegeName: examRegistrations.collegeName,
      course: examRegistrations.course,
      branch: examRegistrations.branch,
      semester: examRegistrations.semester,
      studentName: students.name,
      studentEmail: students.email,
    })
    .from(examRegistrations)
    .leftJoin(students, eq(examRegistrations.studentId, students.id))
    .where(eq(examRegistrations.examId, examId));

    const rollNumbers = registrations.flatMap((registration) =>
      registration.rollNumber ? [registration.rollNumber] : []
    );
    const existingOffers = rollNumbers.length
      ? await studentDb.select({ employeeId: offerLetters.employeeId })
          .from(offerLetters)
          .where(inArray(offerLetters.employeeId, rollNumbers))
      : [];
    const existingEmployeeIds = new Set(
      existingOffers.map((offer) => offer.employeeId)
    );

    const passingScore = exam.passingScore ?? 60;

    return registrations
      .filter(
        (registration) =>
          exam.resultAnnounced &&
          registration.status === "completed" &&
          !registration.cheating &&
          registration.rollNumber &&
          registration.studentName &&
          registration.studentEmail &&
          (registration.score ?? 0) >= passingScore
      )
      .map(reg => ({
        id: reg.id,
        name: reg.studentName || "",
        email: reg.studentEmail || "",
        rollNumber: reg.rollNumber || "",
        score: reg.score ?? 0,
        examName: exam.name || "",
        domain: reg.domain,
        universityName: reg.universityName,
        collegeName: reg.collegeName,
        course: reg.course,
        branch: reg.branch,
        semester: reg.semester,
        hasOfferLetter: existingEmployeeIds.has(reg.rollNumber || ""),
      }));
  } catch (error) {
    console.error("Get students for offer letter error:", error);
    return [];
  }
}

// =====================================================
// CREATE OFFER LETTER FOR STUDENT
// =====================================================

export async function createOfferLetterForStudent(
  registrationId: number
): Promise<OfferLetterResponse> {
  return getOrCreateOfferLetter(registrationId);
}

// =====================================================
// DYNAMIC CONTENT HELPERS
// =====================================================

function getResponsibilities(designation: string): string[] {
  const d = designation.toLowerCase();

  const base = [
    "Complete assigned tasks and projects within the specified deadlines.",
    "Maintain proper documentation of assigned work.",
    "Follow company policies, development practices and professional standards.",
    "Participate in team discussions and meetings.",
  ];

  if (
    d.includes("frontend") ||
    d.includes("ui") ||
    d.includes("ux") ||
    d.includes("design")
  ) {
    return [
      "Design and develop responsive user interfaces using modern frontend technologies.",
      "Collaborate with designers to translate UI/UX designs into functional components.",
      "Optimize web applications for maximum speed and scalability.",
      "Ensure cross-browser compatibility and mobile responsiveness.",
      "Write clean, maintainable and reusable code following best practices.",
      ...base,
    ];
  }

  if (d.includes("backend")) {
    return [
      "Develop and maintain server-side logic, APIs and database schemas.",
      "Integrate frontend components with backend services.",
      "Optimize application performance and ensure data security.",
      "Write efficient database queries and manage data storage solutions.",
      "Implement authentication and authorization mechanisms.",
      ...base,
    ];
  }

  if (d.includes("full stack")) {
    return [
      "Develop both frontend and backend components of web applications.",
      "Build RESTful APIs and integrate them with user-facing features.",
      "Design and manage database schemas and queries.",
      "Ensure end-to-end functionality of applications from UI to database.",
      "Collaborate with cross-functional teams on complete project delivery.",
      ...base,
    ];
  }

  if (d.includes("python")) {
    return [
      "Develop Python-based applications, scripts and automation tools.",
      "Write clean, efficient and well-documented Python code.",
      "Work with Python frameworks and libraries for various use cases.",
      "Debug and optimize existing Python codebases.",
      "Participate in code reviews and follow Python best practices (PEP 8).",
      ...base,
    ];
  }

  if (d.includes("java") && !d.includes("javascript")) {
    return [
      "Develop Java-based applications and enterprise solutions.",
      "Write clean, object-oriented Java code following best practices.",
      "Work with Java frameworks like Spring, Hibernate as required.",
      "Debug and optimize JVM-based applications.",
      "Participate in code reviews and follow Java coding standards.",
      ...base,
    ];
  }

  if (d.includes("javascript") || d.includes("js")) {
    return [
      "Develop modern JavaScript applications using ES6+ features.",
      "Work with JavaScript frameworks and libraries like React, Node.js.",
      "Write clean, asynchronous JavaScript code following best practices.",
      "Debug and optimize JavaScript performance.",
      "Participate in code reviews and follow JavaScript coding standards.",
      ...base,
    ];
  }

  if (d.includes("android")) {
    return [
      "Develop Android applications using Kotlin/Java.",
      "Design and implement user-friendly mobile interfaces.",
      "Integrate REST APIs and third-party libraries into mobile apps.",
      "Optimize app performance and memory usage.",
      "Test and debug applications on multiple Android versions and devices.",
      ...base,
    ];
  }

  if (d.includes("ios")) {
    return [
      "Develop iOS applications using Swift.",
      "Design and implement user-friendly mobile interfaces following Apple HIG.",
      "Integrate REST APIs and third-party libraries into iOS apps.",
      "Optimize app performance and memory usage.",
      "Test and debug applications on multiple iOS versions and devices.",
      ...base,
    ];
  }

  if (
    d.includes("data science") ||
    d.includes("ai") ||
    d.includes("ml")
  ) {
    return [
      "Analyze data sets to extract meaningful insights and patterns.",
      "Build and train machine learning models for various use cases.",
      "Clean, preprocess and prepare data for analysis and modeling.",
      "Evaluate model performance and iterate on improvements.",
      "Create data visualizations and reports for stakeholders.",
      ...base,
    ];
  }

  if (d.includes("cyber") || d.includes("security")) {
    return [
      "Identify and analyze security vulnerabilities in applications and systems.",
      "Participate in security audits and penetration testing exercises.",
      "Assist in implementing security best practices and policies.",
      "Monitor systems for potential security threats and incidents.",
      "Document security findings and recommend remediation measures.",
      ...base,
    ];
  }

  if (d.includes("digital marketing")) {
    return [
      "Assist in creating and executing digital marketing campaigns.",
      "Manage social media accounts and create engaging content.",
      "Analyze marketing metrics and prepare performance reports.",
      "Conduct keyword research and support SEO/SEM efforts.",
      "Support email marketing and content marketing initiatives.",
      ...base,
    ];
  }

  if (d.includes("devops") || d.includes("cloud")) {
    return [
      "Assist in setting up and maintaining CI/CD pipelines.",
      "Work with cloud platforms like AWS, Azure or GCP.",
      "Automate deployment and infrastructure management tasks.",
      "Monitor system health and respond to operational issues.",
      "Document infrastructure and deployment processes.",
      ...base,
    ];
  }

  if (d.includes("c++") || d.includes("cpp")) {
    return [
      "Develop C++ applications and system-level programs.",
      "Write efficient, performant C++ code following best practices.",
      "Work with STL containers and algorithms.",
      "Debug and optimize C++ applications.",
      "Participate in code reviews and follow C++ coding standards.",
      ...base,
    ];
  }

  if (d.includes("flutter")) {
    return [
      "Develop cross-platform mobile applications using Flutter.",
      "Write clean, efficient Dart code following best practices.",
      "Design responsive and beautiful user interfaces.",
      "Integrate REST APIs and third-party packages.",
      "Test and debug applications on multiple platforms.",
      ...base,
    ];
  }

  if (d.includes("blockchain")) {
    return [
      "Develop and test smart contracts on blockchain platforms.",
      "Learn and work with decentralized application (dApp) architecture.",
      "Assist in building secure and efficient blockchain solutions.",
      "Participate in code reviews and follow blockchain best practices.",
      "Document blockchain-based solutions and processes.",
      ...base,
    ];
  }

  // Default
  return [
    "Work on assigned tasks and projects under the guidance of the team.",
    "Gain practical exposure to real-world software development and professional workflows.",
    ...base,
  ];
}

function getLearningObjectives(designation: string): string[] {
  const d = designation.toLowerCase();

  const base = [
    "Gain practical experience in a real-world remote work environment.",
    "Understand professional software development workflows.",
    "Improve technical, communication and problem-solving skills.",
    "Develop professional discipline and workplace ethics.",
  ];

  if (d.includes("frontend") || d.includes("ui") || d.includes("ux")) {
    return [
      "Master modern frontend frameworks and state management.",
      "Learn responsive design principles and accessibility standards.",
      "Understand performance optimization techniques for web applications.",
      ...base,
    ];
  }

  if (d.includes("backend")) {
    return [
      "Learn to design and build scalable backend architectures.",
      "Master database design, optimization and query performance.",
      "Understand API design principles and security best practices.",
      ...base,
    ];
  }

  if (d.includes("full stack")) {
    return [
      "Gain end-to-end understanding of web application development.",
      "Learn to integrate frontend and backend seamlessly.",
      "Master deployment and DevOps basics for full-stack apps.",
      ...base,
    ];
  }

  if (d.includes("python")) {
    return [
      "Master Python programming paradigms and best practices.",
      "Learn popular Python frameworks and libraries.",
      "Understand Pythonic code writing and testing strategies.",
      ...base,
    ];
  }

  if (d.includes("java") && !d.includes("javascript")) {
    return [
      "Master object-oriented programming with Java.",
      "Learn Java frameworks and enterprise development patterns.",
      "Understand JVM internals and performance tuning.",
      ...base,
    ];
  }

  if (d.includes("javascript") || d.includes("js")) {
    return [
      "Master modern JavaScript (ES6+) features and patterns.",
      "Learn asynchronous programming and event-driven architecture.",
      "Understand JavaScript runtime and performance optimization.",
      ...base,
    ];
  }

  if (d.includes("android")) {
    return [
      "Master Android app development lifecycle and best practices.",
      "Learn Material Design principles and modern UI patterns.",
      "Understand app publishing and Play Store guidelines.",
      ...base,
    ];
  }

  if (d.includes("ios")) {
    return [
      "Master iOS app development with Swift and SwiftUI.",
      "Learn Apple Human Interface Guidelines and design patterns.",
      "Understand App Store publishing and review process.",
      ...base,
    ];
  }

  if (
    d.includes("data science") ||
    d.includes("ai") ||
    d.includes("ml")
  ) {
    return [
      "Master data analysis techniques and statistical methods.",
      "Learn machine learning algorithms and model evaluation.",
      "Understand data visualization and storytelling with data.",
      ...base,
    ];
  }

  if (d.includes("cyber") || d.includes("security")) {
    return [
      "Understand common security vulnerabilities and attack vectors.",
      "Learn security testing tools and methodologies.",
      "Master secure coding practices and threat modeling.",
      ...base,
    ];
  }

  if (d.includes("digital marketing")) {
    return [
      "Understand digital marketing channels and strategies.",
      "Learn SEO, SEM and social media marketing techniques.",
      "Master analytics tools and campaign optimization.",
      ...base,
    ];
  }

  if (d.includes("devops") || d.includes("cloud")) {
    return [
      "Understand CI/CD pipelines and deployment automation.",
      "Learn cloud platforms (AWS, Azure, GCP) and their services.",
      "Master infrastructure as code and monitoring tools.",
      ...base,
    ];
  }

  if (d.includes("c++") || d.includes("cpp")) {
    return [
      "Master C++ language features and standard library.",
      "Learn data structures and algorithms in depth.",
      "Understand memory management and performance optimization.",
      ...base,
    ];
  }

  if (d.includes("flutter")) {
    return [
      "Master Flutter framework and Dart programming.",
      "Learn cross-platform mobile development best practices.",
      "Understand state management and app architecture.",
      ...base,
    ];
  }

  if (d.includes("blockchain")) {
    return [
      "Understand blockchain fundamentals and consensus mechanisms.",
      "Learn smart contract development and security.",
      "Master decentralized application architecture.",
      ...base,
    ];
  }

  // Default
  return [
    "Gain practical experience in a real-world remote work environment.",
    "Understand professional software development workflows.",
    "Learn Git-based team collaboration and project management.",
    "Gain experience working with industry-relevant technologies.",
    "Improve technical, communication and problem-solving skills.",
    "Develop professional discipline and workplace ethics.",
  ];
}

function getTechnologies(designation: string): string[] {
  const d = designation.toLowerCase();

  if (d.includes("frontend") || d.includes("ui") || d.includes("ux"))
    return ["React", "Next.js", "TypeScript", "Tailwind CSS", "Figma", "Git"];

  if (d.includes("backend"))
    return ["Node.js", "Express", "PostgreSQL", "REST APIs", "Docker", "Git"];

  if (d.includes("full stack"))
    return ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Git"];

  if (d.includes("python"))
    return ["Python", "Django", "Flask", "PostgreSQL", "REST APIs", "Git"];

  if (d.includes("java") && !d.includes("javascript"))
    return ["Java", "Spring Boot", "Hibernate", "MySQL", "REST APIs", "Git"];

  if (d.includes("javascript") || d.includes("js"))
    return ["JavaScript", "Node.js", "React", "Express", "MongoDB", "Git"];

  if (d.includes("android"))
    return [
      "Kotlin",
      "Java",
      "Android SDK",
      "Jetpack Compose",
      "REST APIs",
      "Git",
    ];

  if (d.includes("ios"))
    return ["Swift", "SwiftUI", "Xcode", "Core Data", "REST APIs", "Git"];

  if (d.includes("data science") || d.includes("ai") || d.includes("ml"))
    return [
      "Python",
      "Pandas",
      "NumPy",
      "Scikit-learn",
      "TensorFlow",
      "Jupyter",
    ];

  if (d.includes("cyber") || d.includes("security"))
    return [
      "Kali Linux",
      "Burp Suite",
      "Wireshark",
      "Metasploit",
      "Nmap",
      "OWASP ZAP",
    ];

  if (d.includes("digital marketing"))
    return [
      "Google Analytics",
      "Google Ads",
      "Meta Ads",
      "SEMrush",
      "Canva",
      "Mailchimp",
    ];

  if (d.includes("devops") || d.includes("cloud"))
    return [
      "Docker",
      "Kubernetes",
      "AWS",
      "GitHub Actions",
      "Terraform",
      "Linux",
    ];

  if (d.includes("c++") || d.includes("cpp"))
    return ["C++", "STL", "Data Structures", "Algorithms", "Git", "CMake"];

  if (d.includes("flutter"))
    return ["Flutter", "Dart", "Firebase", "REST APIs", "Git", "Android Studio"];

  if (d.includes("blockchain"))
    return ["Solidity", "Ethereum", "Web3.js", "Hardhat", "IPFS", "Git"];

  // Default
  return ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Git"];
}