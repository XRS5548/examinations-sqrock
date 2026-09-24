import { z } from "zod";

export const INTERNSHIP_DOMAINS = [
  "Web Development",
  "Data Science",
  "Python",
  "Java",
  "C++",
  "Android Development",
  "Frontend Development",
  "Backend Development",
  "UI/UX Design",
  "Cyber Security",
  "Digital Marketing",
] as const;

export const INTERNSHIP_DURATION_OPTIONS = [
  "15 Days",
  "1 Month",
  "2 Months",
  "3 Months",
  "6 Months",
] as const;

export type InternshipDuration =
  (typeof INTERNSHIP_DURATION_OPTIONS)[number];

export function calculateInternshipEndDate(
  startDate: string,
  duration: InternshipDuration
): string {
  const result = new Date(`${startDate}T00:00:00.000Z`);

  if (duration === "15 Days") {
    result.setUTCDate(result.getUTCDate() + 15);
    return result.toISOString().slice(0, 10);
  }

  const months = Number(duration.split(" ")[0]);
  const originalDay = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();
  result.setUTCDate(Math.min(originalDay, lastDay));
  return result.toISOString().slice(0, 10);
}

const internshipDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Use a valid date");

export const internshipScheduleSchema = z
  .object({
    internshipStartDate: internshipDateSchema,
    internshipEndDate: internshipDateSchema,
    internshipDuration: z
      .string()
      .min(1, "Select an internship duration")
      .refine(
        (value) =>
          INTERNSHIP_DURATION_OPTIONS.some((option) => option === value),
        "Select a valid internship duration"
      ),
  })
  .superRefine((value, context) => {
    if (value.internshipEndDate < value.internshipStartDate) {
      context.addIssue({
        code: "custom",
        path: ["internshipEndDate"],
        message: "End date must be on or after start date",
      });
      return;
    }

    const expectedEndDate = calculateInternshipEndDate(
      value.internshipStartDate,
      value.internshipDuration as InternshipDuration
    );
    if (value.internshipEndDate !== expectedEndDate) {
      context.addIssue({
        code: "custom",
        path: ["internshipEndDate"],
        message: `End date must match ${value.internshipDuration}`,
      });
    }
  });

export type InternshipSchedule = z.infer<
  typeof internshipScheduleSchema
>;
