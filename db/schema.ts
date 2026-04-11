import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  date,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

/* ================= ENUMS ================= */

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "cancelled",
]);

export const examStatusEnum = pgEnum("exam_status", [
  "not_started",
  "in_progress",
  "completed",
  "failed",
]);

export const appealStatusEnum = pgEnum("appeal_status", [
  "pending",
  "approved",
  "rejected",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "mcq",
  "subjective",
]);

/* ================= USERS ================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fname: varchar("fname", { length: 100 }),
  lname: varchar("lname", { length: 100 }),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= COMPANIES ================= */

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 200 }).notNull(),
  website: text("website"),
  industry: varchar("industry", { length: 100 }),
  rollPrefix: varchar("roll_prefix", { length: 10 }).notNull(),
  rollInfix: varchar("roll_infix", { length: 10 }),
  tagline: text("tagline"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= SUBSCRIPTIONS ================= */

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, {
    onDelete: "cascade",
  }),
  planName: varchar("plan_name", { length: 50 }),
  price: integer("price"),
  examLimit: integer("exam_limit"),
  studentLimit: integer("student_limit"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: subscriptionStatusEnum("status"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= EXAMS ================= */

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, {
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 200 }),
  description: text("description"),
  syllabusPdf: text("syllabus_pdf"),
  coverImage: text("cover_image"),
  examDate: timestamp("exam_date"),
  durationMinutes: integer("duration_minutes"),
  totalMarks: integer("total_marks"),
  createdAt: timestamp("created_at").defaultNow(),
  isLive: boolean("is_live").default(false),
  resultAnnounced: boolean("result_announced").default(false),
});

/* ================= STUDENTS ================= */

export const students = pgTable(
  "students",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 150 }),
    dob: date("dob"),
    email: varchar("email", { length: 150 }),
    phone: varchar("phone", { length: 20 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueEmailCompany: unique().on(table.email, table.companyId),
  })
);

/* ================= EXAM REGISTRATIONS ================= */

export const examRegistrations = pgTable("exam_registrations", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => exams.id, {
    onDelete: "cascade",
  }),
  studentId: integer("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  rollNumber: varchar("roll_number", { length: 50 }).unique(),
  score: integer("score").default(0),
  cheating: boolean("cheating").default(false),
  status: examStatusEnum("status").default("not_started"),
  startedAt: timestamp("started_at"),
  submittedAt: timestamp("submitted_at"),
});

/* ================= QUESTIONS ================= */

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => exams.id, {
    onDelete: "cascade",
  }),
  question: text("question").notNull(),
  questionType: questionTypeEnum("question_type").default("mcq"),
  marks: integer("marks").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= OPTIONS ================= */

export const options = pgTable("options", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id, {
    onDelete: "cascade",
  }),
  optionText: text("option_text"),
  isCorrect: boolean("is_correct").default(false),
});

/* ================= STUDENT ANSWERS ================= */

export const studentAnswers = pgTable("student_answers", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").references(
    () => examRegistrations.id,
    { onDelete: "cascade" }
  ),
  questionId: integer("question_id").references(() => questions.id, {
    onDelete: "cascade",
  }),
  selectedOptionId: integer("selected_option_id").references(
    () => options.id
  ),
  answerText: text("answer_text"),
  isCorrect: boolean("is_correct"),
  marksAwarded: integer("marks_awarded").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= APPEALS ================= */

export const appeals = pgTable("appeals", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => exams.id, {
    onDelete: "cascade",
  }),
  studentId: integer("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  reason: text("reason"),
  status: appealStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= ANNOUNCEMENTS ================= */

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, {
    onDelete: "cascade",
  }),
  examId: integer("exam_id").references(() => exams.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= ARTICLES ================= */

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  content: text("content"),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= CHEATING LOGS ================= */

export const cheatingLogs = pgTable("cheating_logs", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").references(
    () => examRegistrations.id,
    { onDelete: "cascade" }
  ),
  eventType: varchar("event_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= EXAM ATTEMPT LOGS ================= */

export const examAttemptLogs = pgTable("exam_attempt_logs", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").references(
    () => examRegistrations.id,
    { onDelete: "cascade" }
  ),
  action: varchar("action", { length: 50 }),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
});