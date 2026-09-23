// actions/offer-letter.ts
"use server";

import { offerLetters } from "@/db/recoards";
import { eq } from "drizzle-orm";
import {
  getDesignation,
  getDepartment,
} from "./offer-letter-helpers";

import { studentDb as db } from "@/db/student-db";

// =====================================================
// TYPES
// =====================================================

export type RegistrationData = {
  // Personal Details
  gender?: string | null;
  phone?: string | null;
  dob?: Date | string | null;

  // Education Details
  universityName?: string | null;
  collegeName?: string | null;
  course?: string | null;
  branch?: string | null;
  semester?: string | null;
  enrollmentNumber?: string | null;
  graduationYear?: number | null;

  // Address Details
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;

  // Preferences
  domain?: string | null;
  preferredStartDate?: string | null;
  preferredDuration?: string | null;

  // Emergency Contact
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
};

export type StudentData = {
  name: string;
  email: string;
  rollNumber: string;
  examName: string;
  registrationData?: RegistrationData;
};

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
  resultId: number,
  studentData: StudentData
): Promise<OfferLetterResponse> {
  const existing = await db
    .select()
    .from(offerLetters)
    .where(eq(offerLetters.employeeId, studentData.rollNumber))
    .limit(1);

  if (existing.length > 0) {
    return serializeOfferLetter(existing[0]);
  }

  const now = new Date();
  const regData = studentData.registrationData;

  // Calculate dates
  const startDate = regData?.preferredStartDate
    ? new Date(regData.preferredStartDate)
    : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const durationMonths = regData?.preferredDuration
    ? parseInt(regData.preferredDuration.split(" ")[0]) || 1
    : 1;

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);

  const offerLetterId = `SQ-INT-${now.getFullYear()}-${String(
    resultId
  ).padStart(5, "0")}`;

  // =====================================================
  // ✅ Pass domain to get designation & department
  // Priority: domain > examName
  // =====================================================

  const designation = getDesignation(
    studentData.examName,
    regData?.domain
  );

  const department = getDepartment(
    studentData.examName,
    regData?.domain
  );

  const [newOffer] = await db
    .insert(offerLetters)
    .values({
      examid: String(resultId),
      offerLetterId,
      employeeId: studentData.rollNumber,
      name: studentData.name,
      email: studentData.email,
      phone: regData?.phone || null,

      designation: designation,
      department: department,
      internshipType: "Unpaid Remote Internship",
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      duration:
        regData?.preferredDuration ||
        `${durationMonths} Month${durationMonths > 1 ? "s" : ""}`,
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
      universityName: regData?.universityName || "",
      course: regData?.course || "",
      branch: regData?.branch || "",
      semester: regData?.semester || "",

      minimumAttendance: 80,
      allowedLeaves: 3,
      noticePeriod: "7 Days",

      hrName: "SANIYA KHAN",
      hrDesignation: "Co-Founder",
      hrEmail: "support@sqrock.cloud",
      hrPhone: "+91 9876543210",

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

// =====================================================
// UPDATE OFFER LETTER DATES
// =====================================================

export async function updateOfferLetterDates(
  offerLetterId: string,
  data: {
    startDate?: string;
    endDate?: string;
    duration?: string;
  }
): Promise<{ success: boolean }> {
  await db
    .update(offerLetters)
    .set({
      startDate: data.startDate,
      endDate: data.endDate,
      duration: data.duration,
    })
    .where(eq(offerLetters.offerLetterId, offerLetterId));

  return { success: true };
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