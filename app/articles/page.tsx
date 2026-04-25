// app/articles/page.tsx
import { Suspense } from "react";
import { getArticles, getFeaturedArticle, getSidebarArticles, getLiveExams, getAnnouncements } from "@/actions/articles-public";
import { Navbar } from "@/websiteComponents/home/Navbar";
import { Footer } from "@/websiteComponents/home/Footer"; 
import { ArticlesHero } from "./ArticlesHero"; 
import { ArticlesGrid } from "./ArticlesGrid"; 
import { ArticleSidebar } from "./ArticleSidebar"; 
import { SearchBar } from "./SearchBar"; 

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const search = params.search || "";
  const sort = params.sort || "newest";

  const [featuredArticle, articlesData, sidebarArticles, liveExams, announcements] = await Promise.all([
    getFeaturedArticle(),
    getArticles({ page: currentPage, search, sort, limit: 9 }),
    getSidebarArticles(),
    getLiveExams(),
    getAnnouncements()
  ]);

  // Transform articles to include category field if needed
  const transformedArticles = articlesData.articles.map(article => ({
    ...article,
    category: "General" // Add default category
  }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ArticlesHero featuredArticle={featuredArticle} />
        
        <div className="mt-16">
          <SearchBar currentSearch={search} currentSort={sort} />
        </div>
        
        <div className="grid lg:grid-cols-3 gap-12 mt-12">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="text-center py-12">Loading articles...</div>}>
              <ArticlesGrid
                articles={transformedArticles}
                total={articlesData.total}
                currentPage={currentPage}
                search={search}
                sort={sort}
              />
            </Suspense>
          </div>
          
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="text-center py-12">Loading sidebar...</div>}>
              <ArticleSidebar
                latestArticles={sidebarArticles}
                liveExams={liveExams}
                announcements={announcements}
              />
            </Suspense>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}