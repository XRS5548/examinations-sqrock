// components/dashboard/company/CreateCompanyForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Globe, Users, Hash, Quote, Image } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createCompany } from "@/actions/company";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(100, "Company name is too long"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  rollPrefix: z.string().min(1, "Roll number prefix is required").max(10, "Prefix is too long"),
  rollInfix: z.string().max(10, "Infix is too long").optional(),
  tagline: z.string().max(200, "Tagline is too long").optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof companySchema>;

const industries = [
  { value: "education", label: "Education" },
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

export function CreateCompanyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      website: "",
      industry: "",
      rollPrefix: "",
      rollInfix: "",
      tagline: "",
      logoUrl: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.website) formData.append("website", data.website);
      if (data.industry) formData.append("industry", data.industry);
      formData.append("rollPrefix", data.rollPrefix);
      if (data.rollInfix) formData.append("rollInfix", data.rollInfix);
      if (data.tagline) formData.append("tagline", data.tagline);
      if (data.logoUrl) formData.append("logoUrl", data.logoUrl);

      const result = await createCompany(formData);

      if (result.success) {
        toast.success("Company created successfully! Redirecting...");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error?.toString() || "Failed to create company");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                placeholder="Acme Inc."
                className="pl-9"
                {...register("name")}
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                className="pl-9"
                {...register("website")}
                disabled={loading}
              />
            </div>
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website.message}</p>
            )}
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              onValueChange={(value) => setValue("industry", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-red-500">{errors.industry.message}</p>
            )}
          </div>

          {/* Roll Number Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rollPrefix" className="text-sm font-semibold">
                Roll Number Prefix <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="rollPrefix"
                  placeholder="SQR"
                  className="pl-9 uppercase"
                  {...register("rollPrefix")}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-500">
                Example: SQR-001 (Prefix will be SQR)
              </p>
              {errors.rollPrefix && (
                <p className="text-sm text-red-500">{errors.rollPrefix.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollInfix">Roll Number Infix (Optional)</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="rollInfix"
                  placeholder="2024"
                  className="pl-9"
                  {...register("rollInfix")}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-500">
                Example: SQR-2024-001 (Infix will be 2024)
              </p>
              {errors.rollInfix && (
                <p className="text-sm text-red-500">{errors.rollInfix.message}</p>
              )}
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <div className="relative">
              <Quote className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                id="tagline"
                placeholder="Empowering education through technology"
                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-9 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400"
                rows={3}
                {...register("tagline")}
                disabled={loading}
              />
            </div>
            {errors.tagline && (
              <p className="text-sm text-red-500">{errors.tagline.message}</p>
            )}
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                className="pl-9"
                {...register("logoUrl")}
                disabled={loading}
              />
            </div>
            {errors.logoUrl && (
              <p className="text-sm text-red-500">{errors.logoUrl.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Company...
              </>
            ) : (
              "Create Company & Continue"
            )}
          </Button>

          <p className="text-xs text-center text-slate-500 mt-4">
            By creating a company, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}