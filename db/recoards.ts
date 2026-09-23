import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  timestamp,
  unique,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const certificates = pgTable(
  "certificates",
  {
    id: serial("id").primaryKey(),

    // Source exam
    examid: text("examid").notNull(),

    // Certificate verification
    verificationCode: varchar("verification_code", {
      length: 100,
    })
      .notNull()
      .unique(),

    // Intern identification
    employeeId: varchar("employee_id", {
      length: 100,
    }).notNull(),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    email: varchar("email", {
      length: 255,
    }),

    phone: varchar("phone", {
      length: 30,
    }),

    // Internship information
    designation: varchar("designation", {
      length: 255,
    }).notNull(),

    department: varchar("department", {
      length: 255,
    }),

    internshipType: varchar("internship_type", {
      length: 100,
    }),

    startDate: date("start_date").notNull(),

    endDate: date("end_date").notNull(),

    duration: varchar("duration", {
      length: 100,
    }),

    performanceGrade: varchar("performance_grade", {
      length: 100,
    }),

    // =====================================================
    // NEW: Education + Project Details
    // =====================================================

    universityName: varchar("university_name", { length: 255 }),
    collegeName: varchar("college_name", { length: 255 }),
    course: varchar("course", { length: 100 }),
    branch: varchar("branch", { length: 100 }),
    semester: varchar("semester", { length: 50 }),
    enrollmentNumber: varchar("enrollment_number", { length: 100 }),

    projectName: varchar("project_name", { length: 255 }),

    technologies: jsonb("technologies"),
    skills: jsonb("skills"),

    // Certificate issue
    issueDate: date("issue_date").notNull(),

    // Email status
    emailStatus: varchar("email_status", {
      length: 30,
    })
      .notNull()
      .default("not_available"),

    // Generated certificate
    certificateUrl: text("certificate_url"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    examStudentUnique: unique().on(table.examid, table.employeeId),
  })
);

export const offerLetters = pgTable("offer_letters", {
  id: serial("id").primaryKey(),

  // Source exam
  examid: text("examid").notNull(),

  // Offer letter identification
  offerLetterId: varchar("offer_letter_id", {
    length: 100,
  })
    .notNull()
    .unique(),

  // Intern identification
  employeeId: varchar("employee_id", {
    length: 100,
  }),

  name: varchar("name", {
    length: 255,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  }),

  phone: varchar("phone", {
    length: 30,
  }),

  // Internship information
  designation: varchar("designation", {
    length: 255,
  }).notNull(),

  department: varchar("department", {
    length: 255,
  }),

  internshipType: varchar("internship_type", {
    length: 100,
  }),

  startDate: date("start_date").notNull(),

  endDate: date("end_date"),

  duration: varchar("duration", {
    length: 100,
  }),

  // Offer details
  stipend: varchar("stipend", {
    length: 100,
  }),

  workMode: varchar("work_mode", {
    length: 50,
  }),

  issueDate: date("issue_date").notNull(),

  // Generated document
  offerLetterUrl: text("offer_letter_url"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  // =====================================================
  // NEW FIELDS - Internship Details
  // =====================================================

  workHours: varchar("work_hours", {
    length: 50,
  }).default("8 hours per day"),

  weeklyHours: integer("weekly_hours").default(40),

  shiftStartTime: varchar("shift_start_time", {
    length: 20,
  }).default("10:00 AM"),

  shiftEndTime: varchar("shift_end_time", {
    length: 20,
  }).default("6:00 PM"),

  breakDuration: varchar("break_duration", {
    length: 50,
  }).default("45 Minutes"),

  // =====================================================
  // Reporting Manager
  // =====================================================

  reportingManager: varchar("reporting_manager", {
    length: 255,
  }).default("Rohit Verma"),

  reportingManagerDesignation: varchar(
    "reporting_manager_designation",
    {
      length: 255,
    }
  ).default("Director"),

  reportingManagerEmail: varchar("reporting_manager_email", {
    length: 255,
  }).default("support@sqrock.cloud"),

  // =====================================================
  // Education Details
  // =====================================================

  universityName: varchar("university_name", {
    length: 255,
  }),

  course: varchar("course", {
    length: 100,
  }),

  branch: varchar("branch", {
    length: 100,
  }),

  semester: varchar("semester", {
    length: 50,
  }),

  // =====================================================
  // Internship Rules
  // =====================================================

  minimumAttendance: integer("minimum_attendance").default(80),

  allowedLeaves: integer("allowed_leaves").default(3),

  noticePeriod: varchar("notice_period", {
    length: 50,
  }).default("7 Days"),

  // =====================================================
  // HR & Signatory
  // =====================================================

  hrName: varchar("hr_name", {
    length: 255,
  }).default("SANIYA KHAN"),

  hrDesignation: varchar("hr_designation", {
    length: 255,
  }).default("Co-Founder"),

  hrEmail: varchar("hr_email", {
    length: 255,
  }).default("support@sqrock.cloud"),

  hrPhone: varchar("hr_phone", {
    length: 30,
  }).default("+91 9876543210"),

  authorizedPersonName: varchar("authorized_person_name", {
    length: 255,
  }).default("Rohit Verma"),

  authorizedPersonDesignation: varchar(
    "authorized_person_designation",
    {
      length: 255,
    }
  ).default("Director"),

  authorizedSignature: text("authorized_signature").default(
    "/rohit.png"
  ),

  companyStamp: text("company_stamp").default("/stamp.png"),

  // =====================================================
  // JSON fields for arrays
  // =====================================================

  responsibilities: jsonb("responsibilities"),

  learningObjectives: jsonb("learning_objectives"),

  technologies: jsonb("technologies"),

  termsAndConditions: jsonb("terms_and_conditions"),

  companyAssets: jsonb("company_assets"),

  // =====================================================
  // Clauses
  // =====================================================

  confidentialityClause: text("confidentiality_clause"),

  intellectualPropertyClause: text("intellectual_property_clause"),

  terminationPolicy: text("termination_policy"),

  codeOfConduct: text("code_of_conduct"),

  performanceReview: text("performance_review"),

  completionCriteria: text("completion_criteria"),

  certificateEligibility: text("certificate_eligibility"),

  leavePolicy: text("leave_policy"),
});