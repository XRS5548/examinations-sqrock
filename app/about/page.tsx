// app/about/page.tsx
import { Suspense } from "react";
import { getPlatformStats, getCompanies } from "@/actions/about";
import { Navbar } from "@/websiteComponents/home/Navbar";
import { Footer } from "@/websiteComponents/home/Footer";
import { AboutHero } from "./AboutHero";
import { MissionSection } from "./MissionSection"; 
import { PlatformFeatures } from "./PlatformFeatures";
import { StatsSection } from "./StatsSection";
import { TimelineSection } from "./TimelineSection";
import { TeamSection } from "./TeamSection";
import { CompaniesSection } from "./CompaniesSection"; 
import { WhyChooseUs } from "./WhyChooseUs"; 
import { FAQSection } from "./FAQSection";

export default async function AboutPage() {
  const stats = await getPlatformStats();
  const companies = await getCompanies();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <AboutHero />
        <MissionSection />
        
        <Suspense fallback={<div className="text-center py-12">Loading stats...</div>}>
          <StatsSection stats={stats} />
        </Suspense>
        
        <PlatformFeatures />
        {/* <TimelineSection /> */}
        <WhyChooseUs />
        
        <Suspense fallback={<div className="text-center py-12">Loading companies...</div>}>
          <CompaniesSection companies={companies} />
        </Suspense>
        
        <TeamSection />
        <FAQSection />
      </main>
      
      <Footer />
    </div>
  );
}