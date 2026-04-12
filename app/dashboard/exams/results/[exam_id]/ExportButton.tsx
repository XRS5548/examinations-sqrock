"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportButton({ examId }: { examId: number }) {
  return (
    <Button
      variant="outline"
      onClick={() => window.location.href = `/api/exports/results/${examId}`}
    >
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}