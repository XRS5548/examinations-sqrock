// components/dashboard/articles/ArticlesTable.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Search, Calendar, FileText, Eye, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditArticleDialog } from "./EditArticleDialog";
import { DeleteArticleDialog } from "./DeleteArticleDialog";
import { Card, CardContent } from "@/components/ui/card";

type Article = {
  id: number;
  title: string | null;
  description: string | null;
  content: string | null;
  coverImage: string | null;
  createdAt: Date | null;
  userId: number;
};

interface ArticlesTableProps {
  initialArticles: Article[];
}

export function ArticlesTable({ initialArticles }: ArticlesTableProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateText = (text: string | null, maxLength: number = 100) => {
    if (!text) return "—";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (articles.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No articles yet</h3>
          <p className="text-muted-foreground mt-2 text-center">
            Create your first article to share knowledge with your audience
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredArticles.length} of {articles.length} articles
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Title</TableHead>
                <TableHead className="w-[40%]">Description</TableHead>
                <TableHead className="w-[20%]">Created At</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {article.title || "Untitled"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {truncateText(article.description, 80)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {article.createdAt
                          ? format(new Date(article.createdAt), "MMM dd, yyyy")
                          : "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setPreviewArticle(article)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingArticle(article)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeletingArticle(article)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredArticles.length === 0 && searchTerm && (
          <div className="text-center py-8 text-muted-foreground">
            No articles found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewArticle} onOpenChange={() => setPreviewArticle(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {previewArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{previewArticle.title}</DialogTitle>
                <DialogDescription>
                  Published on {previewArticle.createdAt 
                    ? format(new Date(previewArticle.createdAt), "MMMM dd, yyyy")
                    : "Unknown date"}
                </DialogDescription>
              </DialogHeader>
              {previewArticle.coverImage && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={previewArticle.coverImage}
                    alt={previewArticle.title || "Article cover"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{previewArticle.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Content</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{previewArticle.content}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <EditArticleDialog
        article={editingArticle}
        open={!!editingArticle}
        onOpenChange={(open) => !open && setEditingArticle(null)}
        onArticleUpdated={(updatedArticle) => {
          setArticles(articles.map(a => 
            a.id === updatedArticle.id ? updatedArticle : a
          ));
          setEditingArticle(null);
        }}
      />

      <DeleteArticleDialog
        article={deletingArticle}
        open={!!deletingArticle}
        onOpenChange={(open) => !open && setDeletingArticle(null)}
        onArticleDeleted={(articleId) => {
          setArticles(articles.filter(a => a.id !== articleId));
          setDeletingArticle(null);
        }}
      />
    </>
  );
}