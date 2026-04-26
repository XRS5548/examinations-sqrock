"use server";

import { db } from "@/db";
import { questions, options } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";

/* ================= VALIDATION ================= */

const createQuestionSchema = z.object({
  examId: z.string(),
  question: z.string().min(1, "Question is required"),
  questionType: z.enum(["mcq", "subjective"]),
  marks: z.string().min(1),
  options: z.string().optional(),
  correctOption: z.string().optional(),
});

/* ================= CREATE ================= */

export async function createQuestion(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await getUserCompany();
    if (!company) return { success: false, error: "No company found" };

    /* 🔥 SAFE DATA EXTRACTION */
    const rawData = {
      examId: formData.get("examId")?.toString() || "",
      question: formData.get("question")?.toString() || "",
      questionType: formData.get("questionType") as "mcq" | "subjective",
      marks: formData.get("marks")?.toString() || "",
      options: formData.get("options")?.toString() || "",
      correctOption: formData.get("correctOption")?.toString() || "",
    };

    const validated = createQuestionSchema.parse(rawData);

    /* 🔥 MCQ VALIDATION */
    if (validated.questionType === "mcq") {
      if (!validated.options) {
        return { success: false, error: "Options required for MCQ" };
      }
    }

    /* 🔥 INSERT QUESTION */
    const [newQuestion] = await db
      .insert(questions)
      .values({
        examId: parseInt(validated.examId),
        question: validated.question,
        questionType: validated.questionType,
        marks: parseInt(validated.marks),
        createdAt: new Date(),
      })
      .returning();

    if (!newQuestion) {
      return { success: false, error: "Failed to create question" };
    }

    /* 🔥 INSERT OPTIONS (ONLY MCQ) */
    if (validated.questionType === "mcq") {
      const optionsData = JSON.parse(validated.options || "[]") as Array<{ text: string }>;
      const correctOptionIndex = parseInt(validated.correctOption || "0");

      for (let i = 0; i < optionsData.length; i++) {
        await db.insert(options).values({
          questionId: newQuestion.id,
          optionText: optionsData[i].text,
          isCorrect: i === correctOptionIndex,
        });
      }
    }

    revalidatePath(`/dashboard/exams/questions/${validated.examId}`);

    return { success: true, question: newQuestion };
  } catch (error) {
    console.error("Create question error:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }

    return { success: false, error: "Failed to create question" };
  }
}

/* ================= UPDATE ================= */

export async function updateQuestion(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const questionId = parseInt(formData.get("questionId")?.toString() || "0");
    const questionText = formData.get("question")?.toString() || "";
    const questionType = formData.get("questionType") as "mcq" | "subjective";
    const marks = parseInt(formData.get("marks")?.toString() || "0");

    const optionsData = formData.get("options")?.toString() || "";
    const correctOption = formData.get("correctOption")?.toString() || "0";

    /* 🔥 UPDATE QUESTION */
    const [updatedQuestion] = await db
      .update(questions)
      .set({
        question: questionText,
        questionType: questionType,
        marks: marks,
      })
      .where(eq(questions.id, questionId))
      .returning();

    if (!updatedQuestion) {
      return { success: false, error: "Failed to update question" };
    }

    /* 🔥 HANDLE MCQ */
    if (questionType === "mcq") {
      await db.delete(options).where(eq(options.questionId, questionId));

      const parsedOptions = JSON.parse(optionsData || "[]") as Array<{ text: string }>;
      const correctIndex = parseInt(correctOption);

      for (let i = 0; i < parsedOptions.length; i++) {
        await db.insert(options).values({
          questionId: questionId,
          optionText: parsedOptions[i].text,
          isCorrect: i === correctIndex,
        });
      }
    }

    revalidatePath(`/dashboard/exams/questions/${updatedQuestion.examId}`);

    return { success: true, question: updatedQuestion };
  } catch (error) {
    console.error("Update question error:", error);
    return { success: false, error: "Failed to update question" };
  }
}

/* ================= DELETE ================= */

export async function deleteQuestion(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const questionData = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    if (!questionData.length) {
      return { success: false, error: "Question not found" };
    }

    const examId = questionData[0].examId;

    await db.delete(questions).where(eq(questions.id, id));

    revalidatePath(`/dashboard/exams/questions/${examId}`);

    return { success: true };
  } catch (error) {
    console.error("Delete question error:", error);
    return { success: false, error: "Failed to delete question" };
  }
}


// actions/questions.ts (add this function with proper types)
import { parse } from "csv-parse/sync";


import { options as optionsTable } from "@/db/schema";

// actions/questions.ts (updated bulkImportQuestions function)

interface QuestionRow {
  "Question Type (mcq/subjective)"?: string;
  "Question Type"?: string;
  "Question Text"?: string;
  Question?: string;
  Marks?: string;
  "Option 1"?: string;
  "Option 2"?: string;
  "Option 3"?: string;
  "Option 4"?: string;
  "Correct Option (1-4)"?: string;
  "Correct Option"?: string;
  Answer?: string;
}


export async function bulkImportQuestions(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const company = await getUserCompany();
    if (!company) {
      return { success: false, error: "No company found" };
    }

    const examId = parseInt(formData.get("examId") as string);
    if (isNaN(examId)) {
      return { success: false, error: "Invalid exam ID" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const content = buffer.toString('utf-8');
    
    // Parse CSV with more flexible options
    const questionsData = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      quote: '"',
      escape: '"',
      delimiter: ',',
    }) as QuestionRow[];

    if (questionsData.length === 0) {
      return { success: false, error: "No data found in file" };
    }

    if (questionsData.length > 500) {
      return { success: false, error: "Maximum 500 questions per import" };
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < questionsData.length; i++) {
      const row = questionsData[i];
      try {
        const questionType = (row["Question Type (mcq/subjective)"] || row["Question Type"] || "").toLowerCase();
        const questionText = row["Question Text"] || row["Question"];
        const marks = row["Marks"];
        
        if (!questionText || !marks) {
          errorCount++;
          errors.push(`Row ${i + 2}: Missing question text or marks`);
          continue;
        }

        if (questionType === "mcq") {
          const options = [
            row["Option 1"],
            row["Option 2"],
            row["Option 3"],
            row["Option 4"],
          ].filter((opt): opt is string => !!opt && opt.trim().length > 0);
          
          if (options.length < 2) {
            errorCount++;
            errors.push(`Row ${i + 2}: At least 2 options required for MCQ`);
            continue;
          }

          const correctOption = parseInt(row["Correct Option (1-4)"] || row["Correct Option"] || "0");
          if (isNaN(correctOption) || correctOption < 1 || correctOption > options.length) {
            errorCount++;
            errors.push(`Row ${i + 2}: Invalid correct option`);
            continue;
          }

          // Insert question
          const [newQuestion] = await db.insert(questions).values({
            examId: examId,
            question: questionText,
            questionType: "mcq",
            marks: parseInt(marks),
            createdAt: new Date(),
          }).returning();

          if (!newQuestion) {
            errorCount++;
            errors.push(`Row ${i + 2}: Failed to insert question`);
            continue;
          }

          // Insert options
          for (let j = 0; j < options.length; j++) {
            await db.insert(optionsTable).values({
              questionId: newQuestion.id,
              optionText: options[j],
              isCorrect: j + 1 === correctOption, // This returns boolean
            });
          }
          
          successCount++;
        } 
        else if (questionType === "subjective") {
          // Insert subjective question
          const [newQuestion] = await db.insert(questions).values({
            examId: examId,
            question: questionText,
            questionType: "subjective",
            marks: parseInt(marks),
            createdAt: new Date(),
          }).returning();

          if (!newQuestion) {
            errorCount++;
            errors.push(`Row ${i + 2}: Failed to insert question`);
            continue;
          }
          
          successCount++;
        }
        else {
          errorCount++;
          errors.push(`Row ${i + 2}: Invalid question type (must be 'mcq' or 'subjective')`);
        }
      } catch (error) {
        errorCount++;
        errors.push(`Row ${i + 2}: ${error}`);
      }
    }

    revalidatePath(`/dashboard/exams/questions/${examId}`);

    if (successCount > 0) {
      return { 
        success: true, 
        count: successCount,
        message: `Imported ${successCount} questions successfully. ${errorCount} failed.`,
        errors: errors.slice(0, 10)
      };
    } else {
      return { 
        success: false, 
        error: "No questions were imported. Please check your file format.",
        errors 
      };
    }
  } catch (error) {
    console.error("Bulk import questions error:", error);
    return { success: false, error: "Failed to import questions" };
  }
}