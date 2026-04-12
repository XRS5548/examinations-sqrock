"use client";

import { Button } from "@/components/ui/button";
import { publishResults } from "@/actions/results";

export function PublishButton({ examId }: { examId: number }) {
  async function handlePublish() {
    const formData = new FormData();
    formData.append("examId", examId.toString());

    const result = await publishResults(formData);
    if (result.success) {
      window.location.reload();
    }
  }

  return (
    <Button onClick={handlePublish}>
      Publish Results
    </Button>
  );
}