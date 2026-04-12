// components/dashboard/settings/CompanyForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Globe, Hash, Quote, Image, Building2 } from "lucide-react";
import { updateCompany } from "@/actions/settings";
import { toast } from "sonner";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  rollPrefix: z.string().min(1, "Roll prefix is required").max(10, "Prefix is too long"),
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

interface CompanyFormProps {
  company: {
    id: number;
    name: string | null;
    website: string | null;
    industry: string | null;
    rollPrefix: string | null;
    rollInfix: string | null;
    tagline: string | null;
    logoUrl: string | null;
  } | null;
}

export function CompanyForm({ company }: CompanyFormProps) {
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || "",
      website: company?.website || "",
      industry: company?.industry || "",
      rollPrefix: company?.rollPrefix || "",
      rollInfix: company?.rollInfix || "",
      tagline: company?.tagline || "",
      logoUrl: company?.logoUrl || "",
    },
  });

  const logoUrl = watch("logoUrl");

  useEffect(() => {
    if (logoUrl && logoUrl.match(/^https?:\/\/.+\..+/)) {
      setLogoPreview(logoUrl);
    } else {
      setLogoPreview("");
    }
  }, [logoUrl]);

  const onSubmit = async (data: FormData) => {
    if (!company) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("companyId", company.id.toString());
      formData.append("name", data.name);
      if (data.website) formData.append("website", data.website);
      if (data.industry) formData.append("industry", data.industry);
      formData.append("rollPrefix", data.rollPrefix.toUpperCase());
      if (data.rollInfix) formData.append("rollInfix", data.rollInfix);
      if (data.tagline) formData.append("tagline", data.tagline);
      if (data.logoUrl) formData.append("logoUrl", data.logoUrl);

      const result = await updateCompany(formData);

      if (result.success) {
        toast.success("Company settings updated successfully");
      } else {
        toast.error(result.error?.toString() || "Failed to update company");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!company) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No company found. Please create a company first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your organization details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                className="pl-9"
                placeholder="Acme Inc."
                {...register("name")}
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                type="url"
                className="pl-9"
                placeholder="https://example.com"
                {...register("website")}
                disabled={loading}
              />
            </div>
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={watch("industry")}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rollPrefix">Roll Number Prefix *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="rollPrefix"
                  className="pl-9 uppercase"
                  placeholder="SQR"
                  {...register("rollPrefix")}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Example: SQR-001
              </p>
              {errors.rollPrefix && (
                <p className="text-sm text-red-500">{errors.rollPrefix.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollInfix">Roll Number Infix (Optional)</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="rollInfix"
                  className="pl-9"
                  placeholder="2024"
                  {...register("rollInfix")}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Example: SQR-2024-001
              </p>
              {errors.rollInfix && (
                <p className="text-sm text-red-500">{errors.rollInfix.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <div className="relative">
              <Quote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="tagline"
                className="pl-9"
                placeholder="Empowering education through technology"
                {...register("tagline")}
                rows={2}
                disabled={loading}
              />
            </div>
            {errors.tagline && (
              <p className="text-sm text-red-500">{errors.tagline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="logoUrl"
                type="url"
                className="pl-9"
                placeholder="https://example.com/logo.png"
                {...register("logoUrl")}
                disabled={loading}
              />
            </div>
            {errors.logoUrl && (
              <p className="text-sm text-red-500">{errors.logoUrl.message}</p>
            )}
          </div>

          {logoPreview && (
            <div className="space-y-2">
              <Label>Logo Preview</Label>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-16 w-16 object-contain rounded"
                  onError={() => setLogoPreview("")}
                />
                <p className="text-sm text-muted-foreground">
                  This is how your logo will appear
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}