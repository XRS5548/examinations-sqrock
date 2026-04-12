// app/dashboard/announcements/page.tsx
import { Suspense } from "react";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserCompany } from "@/actions/company";
import { AnnouncementsTable } from "./AnnouncementsTable"; 
import { CreateAnnouncementDialog } from "./CreateAnnouncementDialog"; 
import { Megaphone } from "lucide-react";

export default async function AnnouncementsPage() {
  const company = await getUserCompany();
  
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Please create a company first</p>
      </div>
    );
  }

  const announcementsList = await db.select()
    .from(announcements)
    .where(eq(announcements.companyId, company.id))
    .orderBy(desc(announcements.createdAt));

  const typedAnnouncements = announcementsList.map(a => ({
    ...a,
    companyId: a.companyId ?? 0,
    examId: a.examId ?? null,
    title: a.title ?? '',
    description: a.description ?? '',
    createdAt: a.createdAt ?? new Date(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Keep your students informed with important updates and notifications
          </p>
        </div>
        <CreateAnnouncementDialog />
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading announcements...</div>}>
        <AnnouncementsTable initialAnnouncements={typedAnnouncements} />
      </Suspense>
    </div>
  );
}