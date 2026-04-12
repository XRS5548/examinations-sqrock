// components/dashboard/articles/CreateArticleDialog.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createArticle } from "@/actions/articles";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import CKEditor to avoid SSR issues
const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  content: z.string().min(1, "Content is required").max(50000, "Content is too long"),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof articleSchema>;

export function CreateArticleDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const editorRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      coverImage: "",
    },
  });

  // Update form value when editor content changes
  useEffect(() => {
    setValue("content", editorContent);
  }, [editorContent, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("content", data.content);
      if (data.coverImage) {
        formData.append("coverImage", data.coverImage);
      }

      const result = await createArticle(formData);

      if (result.success) {
        toast.success("Article created successfully");
        setOpen(false);
        reset();
        setEditorContent("");
        window.location.reload();
      } else {
        toast.error(typeof result.error === "string" ? result.error : "Failed to create article");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Article
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Article</DialogTitle>
          <DialogDescription>
            Share your knowledge by creating educational content
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., How to Prepare for Competitive Exams"
              {...register("title")}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="A brief summary of your article..."
              {...register("description")}
              rows={3}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Max 500 characters
            </p>
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Content * (Rich Text Editor)</Label>
            <div className="border rounded-md overflow-hidden">
              <CKEditor
                editor={ClassicEditor as any}
                data={editorContent}
                onChange={(event: any, editor: any) => {
                  const data = editor.getData();
                  setEditorContent(data);
                }}
                config={{
                  toolbar: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    '|',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'blockQuote',
                    'link',
                    '|',
                    'undo',
                    'redo'
                  ],
                  placeholder: 'Write your article content here...',
                }}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use the rich text editor to format your content. Max 50000 characters.
            </p>
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="coverImage"
                type="url"
                className="pl-9"
                placeholder="https://example.com/image.jpg"
                {...register("coverImage")}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Optional. Provide a URL for the article cover image
            </p>
            {errors.coverImage && (
              <p className="text-sm text-red-500">{errors.coverImage.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Article"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}