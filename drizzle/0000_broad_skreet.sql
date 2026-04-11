CREATE TYPE "public"."appeal_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."exam_status" AS ENUM('not_started', 'in_progress', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('mcq', 'subjective');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"exam_id" integer,
	"title" varchar(200),
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appeals" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_id" integer,
	"student_id" integer,
	"reason" text,
	"status" "appeal_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200),
	"description" text,
	"content" text,
	"user_id" integer,
	"cover_image" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cheating_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"registration_id" integer,
	"event_type" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" varchar(200) NOT NULL,
	"website" text,
	"industry" varchar(100),
	"roll_prefix" varchar(10) NOT NULL,
	"roll_infix" varchar(10),
	"tagline" text,
	"logo_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exam_attempt_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"registration_id" integer,
	"action" varchar(50),
	"data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exam_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_id" integer,
	"student_id" integer,
	"roll_number" varchar(50),
	"score" integer DEFAULT 0,
	"cheating" boolean DEFAULT false,
	"status" "exam_status" DEFAULT 'not_started',
	"started_at" timestamp,
	"submitted_at" timestamp,
	CONSTRAINT "exam_registrations_roll_number_unique" UNIQUE("roll_number")
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" varchar(200),
	"description" text,
	"syllabus_pdf" text,
	"cover_image" text,
	"exam_date" timestamp,
	"duration_minutes" integer,
	"total_marks" integer,
	"created_at" timestamp DEFAULT now(),
	"is_live" boolean DEFAULT false,
	"result_announced" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer,
	"option_text" text,
	"is_correct" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_id" integer,
	"question" text NOT NULL,
	"question_type" "question_type" DEFAULT 'mcq',
	"marks" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"registration_id" integer,
	"question_id" integer,
	"selected_option_id" integer,
	"answer_text" text,
	"is_correct" boolean,
	"marks_awarded" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" varchar(150),
	"dob" date,
	"email" varchar(150),
	"phone" varchar(20),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "students_email_company_id_unique" UNIQUE("email","company_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"plan_name" varchar(50),
	"price" integer,
	"exam_limit" integer,
	"student_limit" integer,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" "subscription_status",
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"fname" varchar(100),
	"lname" varchar(100),
	"email" varchar(150) NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cheating_logs" ADD CONSTRAINT "cheating_logs_registration_id_exam_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."exam_registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_attempt_logs" ADD CONSTRAINT "exam_attempt_logs_registration_id_exam_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."exam_registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_registrations" ADD CONSTRAINT "exam_registrations_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_registrations" ADD CONSTRAINT "exam_registrations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_registration_id_exam_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."exam_registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_selected_option_id_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;