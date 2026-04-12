// components/dashboard/announcements/DeleteAnnouncementDialog.tsx
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
import { deleteAnnouncement } from "@/actions/announcements";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteAnnouncementDialogProps {
  announcement: {
    id: number;
    title: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnnouncementDeleted: (announcementId: number) => void;
}

export function DeleteAnnouncementDialog({
  announcement,
  open,
  onOpenChange,
  onAnnouncementDeleted,
}: DeleteAnnouncementDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!announcement) return;
    
    setLoading(true);
    try {
      const result = await deleteAnnouncement(announcement.id);
      
      if (result.success) {
        toast.success("Announcement deleted successfully");
        onAnnouncementDeleted(announcement.id);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to delete announcement");
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
              <DialogTitle>Delete Announcement</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{announcement?.title}"?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogDescription className="mt-4">
          This action cannot be undone. The announcement will be permanently removed
          and students will no longer see it.
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
            {loading ? "Deleting..." : "Delete Announcement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}