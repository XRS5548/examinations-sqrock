// components/home/AnnouncementsSection.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Announcement = {
  id: number;
  title: string | null;
  description: string | null;
  createdAt: Date | null;
};

interface AnnouncementsSectionProps {
  announcements: Announcement[];
}

export function AnnouncementsSection({ announcements }: AnnouncementsSectionProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  return (
    <>
      <div>
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-t-xl px-6 py-3">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Announcements
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-t-0 border-gray-200 dark:border-gray-800 rounded-b-xl divide-y divide-gray-100 dark:divide-gray-800">
          {announcements.length > 0 ? (
            announcements.slice(0, 5).map((ann) => (
              <div 
                key={ann.id} 
                onClick={() => setSelectedAnnouncement(ann)}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(ann.createdAt!), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">No announcements</div>
          )}
        </div>
      </div>

      {/* Announcement Details Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Bell className="h-4 w-4" />
              <span>
                {selectedAnnouncement?.createdAt
                  ? format(new Date(selectedAnnouncement.createdAt), "MMMM dd, yyyy")
                  : "Recent"}
              </span>
            </div>
            <div className="pt-2">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedAnnouncement?.description || "No additional details available for this announcement."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}