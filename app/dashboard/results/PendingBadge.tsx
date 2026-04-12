// Add this to your dashboard layout or navigation
// components/dashboard/results/PendingBadge.tsx
"use client";

import { useEffect, useState } from "react";
import { getPendingManualChecks } from "@/actions/results2";
import { getUserCompany } from "@/actions/company";
import { Badge } from "@/components/ui/badge";

export function PendingManualChecksBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchPending() {
      const company = await getUserCompany();
      if (company) {
        const pending = await getPendingManualChecks(company.id);
        setCount(pending.length);
      }
    }
    fetchPending();
  }, []);

  if (count === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2">
      {count} Pending
    </Badge>
  );
}