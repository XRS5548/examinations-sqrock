// db/student-db.ts
// ❌ NO "use server" here

import { drizzle } from "drizzle-orm/node-postgres";

export const studentDb = drizzle(
  process.env.STUDENTCERTIFICATES_DATABASE_URL!
);