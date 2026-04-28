// app/page.tsx
import { 
  getAllExams,
  getLiveExams, 
  getUpcomingExams, 
  getAnnouncements, 
  getArticles, 
  getResultExams, 
  getCompanies 
} from "@/actions/home";
import { AnnouncementsSection } from "@/websiteComponents/home/AnnouncementsSection";
import { ArticlesSection } from "@/websiteComponents/home/ArticlesSection";
import { CompaniesGrid } from "@/websiteComponents/home/CompanysGrid";
import { ExamStatusSection } from "@/websiteComponents/home/ExamStatusSection";
import { HeroSection } from "@/websiteComponents/home/HeroSection";
import { Navbar } from "@/websiteComponents/home/Navbar";
import { NewsTicker } from "@/websiteComponents/home/NewsTicker";
import { Footer } from "@/websiteComponents/home/Footer"; 

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const allExams = await getAllExams(); // Fetch all exams (including closed ones)
  const liveExams = await getLiveExams(); // Only open live exams
  const upcomingExams = await getUpcomingExams(); // Only open upcoming exams
  const announcements = await getAnnouncements();
  const articles = await getArticles();
  const resultExams = await getResultExams(); // All result exams (including closed ones)
  const companies = await getCompanies();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <NewsTicker announcements={announcements} />
      <HeroSection allExams={allExams} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <ArticlesSection articles={articles} />
          <AnnouncementsSection announcements={announcements} />
        </div>
      </div>
      <CompaniesGrid companies={companies} />
      <ExamStatusSection 
        liveExams={liveExams} 
        upcomingExams={upcomingExams} 
        resultExams={resultExams} 
      />
      <Footer />
    </div>
  );
}