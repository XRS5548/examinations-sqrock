// app/dashboard/subscription/page.tsx
import { Suspense } from "react";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserCompany } from "@/actions/company";
import { CurrentPlanCard } from "./CurrentPlanCard"; 
import { PlansGrid } from "./PlansGrid";
import { CreditCard } from "lucide-react";
export const dynamic = 'force-dynamic';

export default async function SubscriptionPage() {
  const company = await getUserCompany();
  
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Please create a company first</p>
      </div>
    );
  }

  // Fetch current active subscription
  const currentSubscription = await db.select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.companyId, company.id),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1);

  const activeSubscription = currentSubscription[0] || null;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Manage your plan and billing information
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading subscription...</div>}>
        <CurrentPlanCard subscription={activeSubscription} />
      </Suspense>

      <Suspense fallback={<div className="text-center py-12">Loading plans...</div>}>
        <PlansGrid currentPlan={activeSubscription?.planName || null} />
      </Suspense>
    </div>
  );
}