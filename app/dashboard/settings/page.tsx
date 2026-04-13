// app/dashboard/settings/page.tsx
import { Suspense } from "react";
import { getUserCompany } from "@/actions/company";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";
import { CompanyForm } from "./CompanyForm";
import { Settings, User, Building2 } from "lucide-react";
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const company = await getUserCompany();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Please login first</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Manage your account and company settings
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Suspense fallback={<div className="text-center py-12">Loading profile...</div>}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Profile Settings</h2>
            </div>
            <ProfileForm user={user} />
          </div>
        </Suspense>

        <Suspense fallback={<div className="text-center py-12">Loading company...</div>}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Company Settings</h2>
            </div>
            <CompanyForm company={company} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}