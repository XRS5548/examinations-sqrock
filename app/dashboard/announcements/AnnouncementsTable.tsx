// components/dashboard/announcements/AnnouncementsTable.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Search, Calendar, FileText, Megaphone } from "lucide-react";
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
import { EditAnnouncementDialog } from "./EditAnnouncementDialog"; 
import { DeleteAnnouncementDialog } from "./DeleteAnnouncementDialog";
import { Card, CardContent } from "@/components/ui/card";

type Announcement = {
  id: number;
  companyId: number;
  examId: number | null;
  title: string | null;
  description: string | null;
  createdAt: Date | null;
};

interface AnnouncementsTableProps {
  initialAnnouncements: Announcement[];
}

export function AnnouncementsTable({ initialAnnouncements }: AnnouncementsTableProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateText = (text: string | null, maxLength: number = 100) => {
    if (!text) return "—";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (announcements.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No announcements yet</h3>
          <p className="text-muted-foreground mt-2 text-center">
            Create your first announcement to keep students informed
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
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredAnnouncements.length} of {announcements.length} announcements
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Title</TableHead>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="w-[15%]">Created At</TableHead>
                <TableHead className="w-[5%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {announcement.title || "Untitled"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {truncateText(announcement.description, 80)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {announcement.createdAt
                          ? format(new Date(announcement.createdAt), "MMM dd, yyyy")
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
                        <DropdownMenuItem onClick={() => setEditingAnnouncement(announcement)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeletingAnnouncement(announcement)}
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

        {filteredAnnouncements.length === 0 && searchTerm && (
          <div className="text-center py-8 text-muted-foreground">
            No announcements found matching "{searchTerm}"
          </div>
        )}
      </div>

      <EditAnnouncementDialog
        announcement={editingAnnouncement}
        open={!!editingAnnouncement}
        onOpenChange={(open) => !open && setEditingAnnouncement(null)}
        onAnnouncementUpdated={(updatedAnnouncement) => {
          setAnnouncements(announcements.map(a => 
            a.id === updatedAnnouncement.id ? updatedAnnouncement : a
          ));
          setEditingAnnouncement(null);
        }}
      />

      <DeleteAnnouncementDialog
        announcement={deletingAnnouncement}
        open={!!deletingAnnouncement}
        onOpenChange={(open) => !open && setDeletingAnnouncement(null)}
        onAnnouncementDeleted={(announcementId) => {
          setAnnouncements(announcements.filter(a => a.id !== announcementId));
          setDeletingAnnouncement(null);
        }}
      />
    </>
  );
}