// components/view/ArticleContent.tsx
"use client";

interface ArticleContentProps {
  content: string | null;
}

export function ArticleContent({ content }: ArticleContentProps) {
  if (!content) {
    return (
      <div className="text-center py-12 text-gray-500">
        No content available for this article.
      </div>
    );
  }

  return (
    <article className="prose prose-lg prose-gray max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
      
      <style jsx global>{`
        .prose {
          color: #374151;
          line-height: 1.75;
        }
        .prose h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #111827;
        }
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #111827;
        }
        .prose p {
          margin-bottom: 1rem;
        }
        .prose ul, .prose ol {
          margin-top: 1rem;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.25rem;
        }
        .prose blockquote {
          border-left: 4px solid #C0292A;
          padding-left: 1rem;
          font-style: italic;
          margin: 1.5rem 0;
          color: #4B5563;
        }
        .prose img {
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .prose a {
          color: #C0292A;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #991b1b;
        }
        .prose code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .prose pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .prose th, .prose td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          text-align: left;
        }
        .prose th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>
    </article>
  );
}