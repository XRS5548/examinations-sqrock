// components/dashboard/articles/DeleteArticleDialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteArticle } from "@/actions/articles";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteArticleDialogProps {
  article: {
    id: number;
    title: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArticleDeleted: (articleId: number) => void;
}

export function DeleteArticleDialog({
  article,
  open,
  onOpenChange,
  onArticleDeleted,
}: DeleteArticleDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!article) return;
    
    setLoading(true);
    try {
      const result = await deleteArticle(article.id);
      
      if (result.success) {
        toast.success("Article deleted successfully");
        onArticleDeleted(article.id);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to delete article");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Article</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{article?.title}"?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogDescription className="mt-4">
          This action cannot be undone. The article will be permanently removed
          and all associated content will be deleted.
        </DialogDescription>
        <DialogFooter className="gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Article"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}