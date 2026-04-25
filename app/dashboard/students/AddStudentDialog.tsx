// components/dashboard/students/AddStudentDialog.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Upload, Download, FileSpreadsheet, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createStudent, bulkImportStudents } from "@/actions/students"; 
import { toast } from "sonner";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  dob: z.string().optional(),
});

type FormData = z.infer<typeof studentSchema>;

export function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.email) formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.dob) formData.append("dob", data.dob);

      const result = await createStudent(formData);

      if (result.success) {
        toast.success("Student added successfully");
        setOpen(false);
        reset();
        window.location.reload();
      } else {
        toast.error(result.error?.toString() || "Failed to add student");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setUploadedFile(file);
    
    // Simulate upload progress
    setImportLoading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await bulkImportStudents(formData);
      
      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        toast.success(`Successfully imported ${result.count || 0} students`);
        setOpen(false);
        setUploadedFile(null);
        setUploadProgress(0);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to import students");
      }
    } catch (error) {
      toast.error("Something went wrong during import");
    } finally {
      setImportLoading(false);
      setUploadProgress(0);
    }
  };

  const downloadSampleCSV = () => {
    const headers = ["Name", "Email", "Phone", "Date of Birth (YYYY-MM-DD)"];
    const sampleData = [
      ["John Doe", "john@example.com", "+1 234 567 8900", "2000-01-15"],
      ["Jane Smith", "jane@example.com", "+1 234 567 8901", "1999-05-20"],
      ["Mike Johnson", "mike@example.com", "+1 234 567 8902", "2001-11-10"],
    ];
    
    const csvContent = [
      headers.join(","),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Sample CSV downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Students</DialogTitle>
          <DialogDescription>
            Add students individually or bulk import via CSV/Excel file.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Student</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register("name")}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  {...register("email")}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  {...register("phone")}
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  {...register("dob")}
                  disabled={loading}
                />
                {errors.dob && (
                  <p className="text-sm text-red-500">{errors.dob.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Student"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {!uploadedFile ? (
                <>
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload CSV or Excel file with student data
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    File should contain: Name, Email, Phone, Date of Birth
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={downloadSampleCSV}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Sample CSV
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadProgress(0);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {importLoading && (
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Importing... {uploadProgress}%
                      </p>
                    </div>
                  )}
                  
                  {!importLoading && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="mt-2"
                    >
                      Choose Different File
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 Instructions:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• First row should contain column headers</li>
                <li>• Required columns: Name, Email, Phone, Date of Birth (YYYY-MM-DD)</li>
                <li>• Email and Phone are optional but recommended</li>
                <li>• Date format should be YYYY-MM-DD (e.g., 2000-01-15)</li>
                <li>• Maximum 1000 students per import</li>
                <li>• Duplicate emails will be skipped</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}