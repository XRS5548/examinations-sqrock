// actions/about.ts
"use server";

import { db } from "@/db";
import { companies, students, exams } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function getPlatformStats() {
  try {
    const companiesCount = await db.select({ count: sql<number>`count(*)` }).from(companies);
    const studentsCount = await db.select({ count: sql<number>`count(*)` }).from(students);
    const examsCount = await db.select({ count: sql<number>`count(*)` }).from(exams);

    return {
      companies: Number(companiesCount[0]?.count || 0),
      students: Number(studentsCount[0]?.count || 0),
      exams: Number(examsCount[0]?.count || 0),
    };
  } catch (error) {
    console.error("Get platform stats error:", error);
    return { companies: 80, students: 200000, exams: 300 };
  }
}

export async function getCompanies(limit: number = 8) {
  try {
    const companiesList = await db
      .select({
        id: companies.id,
        name: companies.name,
        industry: companies.industry,
        logoUrl: companies.logoUrl,
      })
      .from(companies)
      .orderBy(companies.name)
      .limit(limit);

    return companiesList;
  } catch (error) {
    console.error("Get companies error:", error);
    return [];
  }
}